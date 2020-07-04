import { s3, tileUrl } from '../utils'
import { S3_BUCKET, CONCURRENT_DOWNLOADS, JPEG_QUALITY } from '../config'
import PQueue from 'p-queue'
import got from 'got'
import sharp from 'sharp'

// TODO @mapbox/mbtiles requires sqlite therefore python (?)
// import MBTiles from '@mapbox/mbtiles'

/**
 * @param source the S3 object key, prefixed by the bucket name e.g. bucketname/
 */
export const getTileSet = async (
  tiles: number[][],
  template: string,
  slug: string
  // TODO min Zoom
  // TODO compression
  // TODO format jpg/png
) => {
  console.log(
    ` [*] Loading ${tiles.length} tiles from the ${slug} provider: ${template}.`
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
  // TODO progress - via a rabbitmq fanout?
  // TODO 1.a. check if the tile has been dowloaded already
  // TODO 1.b. else download save the file 'as-is' (png)
  // TODO 2. compress then in the mbtiles if required
  // * Loop in the tiles
  for (const [x, y, z] of tiles) {
    // * get the right url from the template and the coordinates
    const url = tileUrl(template, [x, y, z])
    console.log(` [*] Download tile ${url}`)
    // * Queue the task - will not run more than CONCURRENT_DOWNLOADS promises
    await pQueue.add(async () => {
      // * Create a basic image processsing stream
      const sharpStream = sharp({
        failOnError: false
      })
      // * Prepare the image processing stream
      const imageProcessing = new Promise((resolve, reject) =>
        // TODO do not process small/empty tiles - ? keep as is for the tiles server, but remove them when exporting to mbtiles?
        // TODO only compress tiles in mbtiles. Keep/convert to png for the tiles server
        sharpStream
          .clone() // * Keep the original
          .jpeg({ quality: JPEG_QUALITY })
          .toBuffer((err, data) => {
            if (err) return reject(err)
            // * Once the image tile is processed, put it to the S3 bucket
            s3.putObject(
              {
                Bucket: S3_BUCKET,
                Key: `tile/${slug}/${z}/${x}/${y}.jpg`, // ? tile/provider/{z}/${x}/${y}.{jpg,png}
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
      )
      // * Download from the HTTP tile server, and pipe to the above stream
      got.stream(url).pipe(sharpStream)
      // * Wait for the image processing to be done
      await imageProcessing
    })
  }
  // * Wait for all the tiles to be processed
  await pQueue.onIdle()
  console.log(' [*] Done dowloading the tile set.')
}
