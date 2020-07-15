const wsProtocol = window.location.protocol.replace('http', 'ws')
const host = window.location.host

export const HBP_ENDPOINT = process.env.PROD
  ? `${window.location.protocol}//hbp.${host}`
  : 'http://localhost:3000'

export const HASURA_WS_ENDPOINT = process.env.PROD
  ? `${wsProtocol}//hasura.${host}/v1/graphql`
  : 'ws://localhost:8080/v1/graphql'
