import { Channel, connect } from 'amqplib'
import { RABBITMQ_URL } from './config'

export const createChannel = async () => {
  const connection = await connect(RABBITMQ_URL)
  return await connection.createChannel()
}

export const startQueue = async (
  channel: Channel,
  name: string,
  handler: (message: string) => Promise<void>
): Promise<void> => {
  const q = await channel.assertQueue(name, {
    durable: false // ? Is it ok ?
  })
  console.log(' [*] Waiting for messages in %s.', q.queue)
  await channel.consume(
    q.queue,
    msg => {
      if (msg) {
        const strMessage = msg.content.toString()
        console.log(` [*] [${q.queue}] Received message ${strMessage}`)
        handler(strMessage)
      }
    },
    {
      noAck: true // ? Is it ok ?
    }
  )
}
