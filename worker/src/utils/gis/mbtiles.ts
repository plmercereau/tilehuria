import MBTiles from '@mapbox/mbtiles'
import zlib from 'zlib'
type MbTilesOptions = {
  write?: boolean
  create?: boolean
}
export class MbTiles {
  private mbTiles: MBTiles | undefined = undefined
  private path: string
  private mode: string
  private writing: boolean = false
  constructor(path: string, options?: MbTilesOptions) {
    this.path = path
    this.mode = options?.write ? (options?.create ? 'rwc' : 'rw') : 'ro'
  }

  private async initMbTiles(): Promise<void> {
    return new Promise((resolve, reject) => {
      new MBTiles(`${this.path}?mode=${this.mode}`, (err, mbTiles) => {
        if (err) return reject(err)
        this.mbTiles = mbTiles
        resolve()
      })
    })
  }
  static async create(path: string, options?: MbTilesOptions) {
    const newMbTiles = new MbTiles(path, options)
    await newMbTiles.initMbTiles()
    return newMbTiles
  }
  async getTile([x, y, z]: number[]) {
    // TODO optional gzip
    return new Promise((resolve, reject) => {
      if (this.mbTiles) {
        this.mbTiles.getTile(z, x, y, (err: Error, data: any) => {
          if (err) return reject(err)
          zlib.gunzip(data, (err, unzippedData) => {
            if (err) return reject(err)
            return resolve(unzippedData)
          })
        })
      } else reject('not initalised')
    })
  }
  async getInfo() {
    return new Promise((resolve, reject) => {
      if (this.mbTiles) {
        this.mbTiles.getInfo((err: Error, info: any) => {
          if (err) return reject(err)
          return resolve(info)
        })
      } else reject('not initalised')
    })
  }
  private async startWriting() {
    return new Promise((resolve, reject) => {
      if (this.mbTiles) {
        if (!this.writing)
          this.mbTiles.startWriting((err: Error) => {
            if (err) return reject(err)
            this.writing = true
            resolve()
          })
        else resolve()
      } else reject('not initialised')
    })
  }
  async stopWriting() {
    return new Promise((resolve, reject) => {
      if (this.mbTiles) {
        if (this.writing)
          this.mbTiles.stopWriting((err: Error) => {
            if (err) return reject()
            this.writing = false
            resolve()
          })
        else resolve()
      } else reject('not initialised')
    })
  }
  async putTile(
    // TODO optional gzip
    [x, y, z]: number[],
    buffer: Buffer
  ) {
    await this.startWriting()
    return new Promise((resolve, reject) => {
      zlib.gzip(buffer, (err, gzippedBuffer) => {
        if (err) return reject(err)
        if (this.mbTiles) {
          this.mbTiles.putTile(z, x, y, buffer, (err: Error) => {
            if (err) return reject(err)
            resolve()
          })
        } else reject('not initialised')
      })
    })
  }
  async putInfo(info: Record<string, string | number | boolean>) {
    await this.startWriting()
    return new Promise((resolve, reject) => {
      if (this.mbTiles) {
        this.mbTiles.putInfo(info, (err: Error) => {
          if (err) return reject(err)
          resolve()
        })
      } else reject('not initialised')
    })
  }
}
