import { createChannel } from './utils'
import { tileSetQueue, areaOfInterestTilesQueue } from './queues'
import { RABBITMQ_URL } from './config'

export const watchAmqp = async () => {
  // ? All queues on the same channel, or one channel per queue?
  const channel = await createChannel(RABBITMQ_URL)
  await tileSetQueue(channel)
  await areaOfInterestTilesQueue(channel)
}
