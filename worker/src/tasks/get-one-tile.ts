import { s3, tileUrl } from '../utils'
import { S3_BUCKET } from '../config'
import got from 'got'
import { Readable, PassThrough } from 'stream'
export const getOneTile = async (
  [x, y, z]: number[],
  template: string,
  slug: string
): Promise<Readable> => {
  const params = {
    Bucket: S3_BUCKET,
    Key: `tile/${slug}/${z}/${x}/${y}.png`
  }
  const meta = await s3.headObject(params).promise()
  if (meta) return s3.getObject(params).createReadStream()
  else {
    const url = tileUrl([x, y, z], template)
    console.log(` [*] Download tile ${url}`)
    function uploadFromStream() {
      var pass = new PassThrough()
      s3.upload({ ...params, Body: pass })
      return pass
    }
    return got.stream(url).pipe(uploadFromStream())
  }
}
