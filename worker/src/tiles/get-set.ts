import { s3 } from '../utils'
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
  url: string,
  slug: string
) => {
  console.log(
    ` [*] Downloading ${tiles.length} tiles from the ${slug} provider: ${url}.`
  )
  // * Set a Queue with CONCURRENT_DOWNLOADS
  const queue = new PQueue({ concurrency: CONCURRENT_DOWNLOADS })

  // TODO mbtiles
  // const mbTiles = new MBTiles(
  //   './path/to/file.mbtiles?mode={ro, rw, rwc}',
  //   function (err, mbtiles) {
  //     console.log(mbtiles) // mbtiles object with methods listed below
  //   }
  // )
  // TODO progress - via a rabbitmq fanout?
  // * Loop in the tiles
  for (const [x, y, z] of tiles) {
    console.log(` [*] Download tile`, x, y, z)
    // * Queue the task - will not run more than CONCURRENT_DOWNLOADS promises
    await queue.add(async () => {
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
      // TODO parse server url
      // TODO Note that in the TMS tiling scheme, the Y axis is reversed from the "XYZ" coordinate system commonly used in the URLs to request individual tiles, so the tile commonly referred to as 11/327/791 is inserted as zoom_level 11, tile_column 327, and tile_row 1256, since 1256 is 2^11 - 1 - 791.
      // TODO switch https://{switch:a,b,c}.tile.openstreetmap.org/{zoom}/{x}/{y}.png
      got
        .stream(`https://b.tile.openstreetmap.org/${z}/${x}/${y}.png`)
        .pipe(sharpStream)
      // * Wait for the image processing to be done
      await imageProcessing
    })
  }
  // * Wait for all the tiles to be processed
  await queue.onIdle()
  console.log(' [*] Done dowloading the tile set.')
}
