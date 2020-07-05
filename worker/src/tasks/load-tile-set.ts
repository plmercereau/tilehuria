import PQueue from 'p-queue'
import sharp from 'sharp'
import { CONCURRENT_DOWNLOADS, JPEG_QUALITY, PNG_QUALITY } from '../config'
import { getOneTile } from './get-one-tile'

// TODO @mapbox/mbtiles requires sqlite therefore python (?)
// import MBTiles from '@mapbox/mbtiles'

/**
 * @param source the S3 object key, prefixed by the bucket name e.g. bucketname/
 */
export const loadTileSet = async ({
  url,
  slug,
  xyzCoordinates,
  format = 'png',
  quality
}: {
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

  // TODO mbtiles
  // const mbTiles = new MBTiles(
  //   './path/to/file.mbtiles?mode={ro, rw, rwc}',
  //   function (err, mbtiles) {
  //     console.log(mbtiles) // mbtiles object with methods listed below
  //   }
  // )
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
        // TODO only compress tiles in mbtiles. Keep/convert to png for the tiles server
        const stream = sharpStream.clone() // * Keep the original
        if (format === 'jpg') stream.jpeg({ quality: quality || JPEG_QUALITY })
        else stream.png({ quality: quality || PNG_QUALITY })
        return stream.toBuffer(err => {
          // *(err, data) => {
          if (err) return reject(err)
          // TODO mbtiles processing
          resolve()
          // s3.putObject(
          //   {
          //     Bucket: S3_BUCKET,
          //     Key: `mbtiles/${slug}/${z}/${x}/${y}.jpg`, // ? tile/provider/{z}/${x}/${y}.{jpg,png}
          //     Body: data
          //   },
          //   (err, status) => {
          //     if (err) {
          //       console.log('error in putting to S3', err)
          //       console.log('status:', status)
          //       return reject(status)
          //     }
          //     resolve(status)
          //   }
          // )
        })
      })
      tileStream.pipe(sharpStream)
      // * Wait for the image processing to be done
      await imageProcessing
    })
  }
  // * Wait for all the tiles to be processed
  await pQueue.onIdle()
  console.log(' [*] Done downloading the tile set.')
}
