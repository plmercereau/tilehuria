import amqp from 'amqplib/callback_api'
import { RABBITMQ_URL, TILE_SET_QUEUE } from './config'
let channel: amqp.Channel

export const createQueue = (queue: string) => {
  console.log(` [*] Created queue ${queue}.`)
  channel.assertQueue(queue, {
    durable: false,
  })
}

export const sendMessage = (queue: string, message: string) => {
  channel.sendToQueue(queue, Buffer.from(message))
  console.log(`[*] Sent "${message}" to the queue ${queue}.`)
}

export const connect = () =>
  new Promise((resolve, reject) =>
    amqp.connect(RABBITMQ_URL, (error0, connection) => {
      if (error0) return reject(error0)

      connection.createChannel((error1, _channel) => {
        if (error1) return reject(error1)
        channel = _channel
        createQueue(TILE_SET_QUEUE)
        resolve()
      })
    })
  )
