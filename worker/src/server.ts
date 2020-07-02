import amqp from 'amqplib/callback_api'
import { RABBITMQ_URL, TILE_SET_QUEUE } from './config'
import { downloadTiles } from './download-tiles'

export const receiveAoi = () =>
  new Promise((resolve, reject) =>
    amqp.connect(RABBITMQ_URL, (error0, connection) => {
      if (error0) return reject(error0)
      connection.createChannel((error1, channel) => {
        if (error1) return reject(error1)
        const queue = TILE_SET_QUEUE
        channel.assertQueue(
          queue,
          {
            durable: false,
          },
          (error2, q) => {
            if (error2) return reject(error2)

            console.log(
              ' [*] Waiting for messages in %s. To exit press CTRL+C',
              q.queue
            )

            channel.consume(
              q.queue,
              (msg) => {
                if (msg) {
                  const strTileSet = msg.content.toString()
                  console.log(
                    ` [*] [${q.queue}] Received message ${strTileSet}`
                  )
                  const {
                    url,
                    slug,
                    xyzCoordinates,
                  }: {
                    url: string
                    slug: string
                    xyzCoordinates: number[][]
                  } = JSON.parse(strTileSet)
                  downloadTiles(xyzCoordinates, url, slug)
                }
              },
              {
                noAck: true,
              }
            )
            resolve()
          }
        )
      })
    })
  )
