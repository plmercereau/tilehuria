export const RABBITMQ_DEFAULT_USER =
  process.env.RABBITMQ_DEFAULT_USER || 'guest'
export const RABBITMQ_DEFAULT_PASS =
  process.env.RABBITMQ_DEFAULT_PASS || 'guest'
export const HASURA_GRAPHQL_ADMIN_SECRET = process.env
  .HASURA_GRAPHQL_ADMIN_SECRET as string

export const HASURA_ENDPOINT = 'http://graphql-engine:8080/v1/graphql'
export const PORT = 3000

export const RABBITMQ_URL = `amqp://${RABBITMQ_DEFAULT_USER}:${RABBITMQ_DEFAULT_PASS}@rabbitmq`
export const TILE_SET_QUEUE = 'tile_set_queue'

export const MIN_ZOOM = 1
export const MAX_ZOOM = 19
