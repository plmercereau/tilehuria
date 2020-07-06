import Auth from 'nhost-js-sdk/dist/Auth'
import { HASURA_WS_ENDPOINT } from 'src/config'
import ApolloClient from 'apollo-client'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SubscriptionClient, Operations } from 'subscriptions-transport-ws'
import { onError } from 'apollo-link-error'
import MessageTypes from 'subscriptions-transport-ws/dist/message-types'

export const createApolloClient = (getToken: () => string | undefined) => {
  const getHeaders = () => {
    const headers: Record<string, string> = {}
    const token = getToken()
    if (token) {
      headers.authorization = `Bearer ${token}`
    }
    return headers
  }

  const wsClient = new SubscriptionClient(HASURA_WS_ENDPOINT, {
    reconnect: true,
    connectionParams: () => {
      return { headers: getHeaders() }
    }
  })
  const link = new WebSocketLink(wsClient)

  const errorLink = onError(({ operation, networkError, forward }) => {
    if (
      networkError?.message?.includes(
        'Missing Authorization header in JWT authentication mode'
      )
    ) {
      const token = getToken()
      if (token) {
        // TODO weird TS error
        // const operations: Operations = {...wsClient.operations}
        const operations = (wsClient.operations as unknown) as Operations
        if (wsClient) {
          wsClient.close()
          // .connect()
        }
        Object.keys(operations).forEach(id => {
          ;(wsClient as any).sendMessage(
            id,
            MessageTypes.GQL_START,
            operations[id].options
          )
        })
        return forward(operation)
      } else {
        console.log('error')
        // return { networkError }
      }
    }
  })

  const apolloClient = new ApolloClient({
    link: errorLink.concat(link),
    cache: new InMemoryCache({
      addTypename: true
    })
  })

  return apolloClient
}
