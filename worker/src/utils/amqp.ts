import { Channel, connect } from 'amqplib'

export const createChannel = async (url: string) => {
  const connection = await connect(url)
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
