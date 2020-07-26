import ApolloClient from 'apollo-client'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { onError } from 'apollo-link-error'
import Auth from 'nhost-js-sdk/dist/Auth'
// import MessageTypes from 'subscriptions-transport-ws/dist/message-types'

export const createApolloClient = (uri: string, auth: Auth | undefined) => {
  const getHeaders = () => {
    console.log('get Headers')
    const headers: Record<string, string> = {}
    const token = auth?.getJWTToken()
    if (token) {
      headers.authorization = `Bearer ${token}`
    }
    console.log(headers)
    return headers
  }

  const wsClient = new SubscriptionClient(uri, {
    reconnect: true,
    connectionParams: () => {
      return { headers: getHeaders() }
    }
  })
  const link = new WebSocketLink(wsClient)

  const errorLink = onError(
    ({ operation, networkError, graphQLErrors, forward }) => {
      if (
        networkError?.message?.includes(
          'Missing Authorization header in JWT authentication mode'
        ) ||
        networkError?.message?.includes('JWSInvalidSignature')
      ) {
        const token = auth?.getJWTToken()
        if (token) {
          // TODO weird TS error
          // const operations: Operations = {...wsClient.operations}
          // const operations = (wsClient.operations as unknown) as Operations
          if (wsClient) {
            wsClient.close()
            // .connect()
          }
          // Object.keys(operations).forEach(id => {
          //   ;(wsClient as any).sendMessage(
          //     id,
          //     MessageTypes.GQL_START,
          //     operations[id].options
          //   )
          // })
          return forward(operation)
        } else {
          console.error(graphQLErrors || networkError)
        }
      }
    }
  )
  auth?.onAuthStateChanged(() => {
    console.log('auth state changed!!!')
    console.log(wsClient.status)
    wsClient.close()
    console.log(wsClient.status)
  })
  const apolloClient = new ApolloClient({
    link: errorLink.concat(link),
    cache: new InMemoryCache({
      addTypename: true
    })
  })

  return apolloClient
}
