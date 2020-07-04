import { Channel } from 'amqplib'
import { TILE_SET_QUEUE } from '../config'
import { getTileSet } from '../tiles'
import { startQueue } from '../utils'

export const tileSetQueue = async (channel: Channel) => {
  await startQueue(channel, TILE_SET_QUEUE, async (message: string) => {
    const {
      url,
      slug,
      xyzCoordinates
    }: {
      url: string
      slug: string
      xyzCoordinates: number[][]
    } = JSON.parse(message)
    await getTileSet(xyzCoordinates, url, slug)
  })
}
