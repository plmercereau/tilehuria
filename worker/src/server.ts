import { createChannel } from './utils'
import { tileSetQueue } from './queues'

export const watchAmqp = async () => {
  const channel = await createChannel()
  await tileSetQueue(channel)
}
