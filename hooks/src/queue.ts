import { Channel, connect } from 'amqplib'
import { RABBITMQ_URL, TILE_SET_QUEUE } from './config'
let channel: Channel

export const createQueue = (queue: string) => {
  console.log(` [*] Created queue ${queue}.`)
  channel.assertQueue(queue, {
    durable: false
  })
}

export const sendMessage = (queue: string, message: string) => {
  channel.sendToQueue(queue, Buffer.from(message))
  console.log(`[*] Sent "${message}" to the queue ${queue}.`)
}

export const connectQueues = async () => {
  const connection = await connect(RABBITMQ_URL)
  channel = await connection.createChannel()
  createQueue(TILE_SET_QUEUE)
}
