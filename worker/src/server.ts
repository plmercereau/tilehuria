import { createChannel } from './utils'
import { tileSetQueue } from './queues'
import { RABBITMQ_URL } from './config'

export const watchAmqp = async () => {
  const channel = await createChannel(RABBITMQ_URL)
  await tileSetQueue(channel)
}
