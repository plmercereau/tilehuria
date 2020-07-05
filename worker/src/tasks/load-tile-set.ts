import PQueue from 'p-queue'
import sharp from 'sharp'
import {
  CONCURRENT_DOWNLOADS,
  JPEG_QUALITY,
  PNG_QUALITY,
  S3_BUCKET
} from '../config'
import { getOneTile } from './get-one-tile'
import { MbTiles, s3 } from '../utils'
import tempDirectory from 'temp-dir'
import path from 'path'
import fs from 'fs'
/**
 * @param source the S3 object key, prefixed by the bucket name e.g. bucketname/
 */
export const loadTileSet = async ({
  name,
  userId,
  url,
  slug,
  xyzCoordinates,
  format = 'png',
  quality
}: {
  name: string
  userId: string
  url: string
  slug: string
  xyzCoordinates: number[][]
  format: 'png' | 'jpg'
  quality?: number
}) => {
  console.log(
    ` [*] Loading ${xyzCoordinates.length} tiles from the ${slug} provider: ${xyzCoordinates}.`
  )
  // * Set a Queue with CONCURRENT_DOWNLOADS
  const pQueue = new PQueue({ concurrency: CONCURRENT_DOWNLOADS })

  const tmpFileName = path.join(tempDirectory, name)
  const mbTiles = await MbTiles.create(tmpFileName, {
    write: true,
    create: true
  })

  // TODO progress - via a rabbitmq fanout? -> persist in DB
  // * Loop in the tiles
  for (const [x, y, z] of xyzCoordinates) {
    // * Queue the task - will not run more than CONCURRENT_DOWNLOADS promises
    await pQueue.add(async () => {
      const tileStream = await getOneTile([x, y, z], url, slug)
      // * Create a basic image processsing stream
      const sharpStream = sharp({
        failOnError: false
      })
      // * Prepare the image processing stream
      const imageProcessing = new Promise((resolve, reject) => {
        // TODO do not process small/empty tiles - ? keep as is for the tiles server, but remove them when exporting to mbtiles?
        const stream = sharpStream.clone()
        if (format === 'jpg') stream.jpeg({ quality: quality || JPEG_QUALITY })
        else stream.png({ quality: quality || PNG_QUALITY })
        return stream.toBuffer((err, data) => {
          if (err) return reject(err)
          mbTiles.putTile([x, y, z], data)
          resolve()
        })
      })
      tileStream.pipe(sharpStream)
      // * Wait for the image processing to be done
      await imageProcessing
      tileStream.destroy()
    })
  }
  // * Wait for all the tiles to be processed
  await pQueue.onIdle()
  await mbTiles.stopWriting()
  await new Promise((resolve, reject) => {
    fs.readFile(tmpFileName, (err, data) => {
      if (err) return reject()
      s3.putObject(
        {
          Bucket: S3_BUCKET,
          Key: `mbtiles/${userId}/${slug}/${name}.mbtiles`,
          Body: data
        },
        (err, status) => {
          if (err) {
            console.log('error in putting to S3', err)
            console.log('status:', status)
            return reject(status)
          }
          resolve(status)
        }
      )
    })
  })
  fs.unlinkSync(tmpFileName)
  console.log(' [*] Done downloading the tile set.')
}
