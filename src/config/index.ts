export * from './area-of-interest'
export * from './tile-provider'
export * from './tile-set'
// ! https://the-guild.dev/blog/graphql-codegen-best-practices

const host = window.location.host

export const HBP_ENDPOINT = process.env.PROD
  ? `${window.location.protocol}//hbp.${host}`
  : 'http://localhost:3000'

export const HASURA_HTTP_ENDPOINT = process.env.PROD
  ? `${window.location.protocol}//hasura.${host}/v1/graphql`
  : 'http://localhost:8080/v1/graphql'

export const DEFAULT_TILE_LAYER =
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
