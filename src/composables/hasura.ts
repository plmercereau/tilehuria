import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { onError } from 'apollo-link-error'
import { setContext } from 'apollo-link-context'
import { getMainDefinition } from 'apollo-utilities'
import { from, split, ApolloLink } from 'apollo-link'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import Auth from 'nhost-js-sdk/dist/Auth'

import introspectionResult from 'src/generated/fragment-matcher'
const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: introspectionResult
})
export const createApolloClient = (httpUri: string, auth: Auth | undefined) => {
  const wsUri = httpUri.replace('http', 'ws')

  const getHeaders = () => {
    const headers: Record<string, string> = {}
    const token = auth?.getJWTToken()
    if (token) {
      headers.authorization = `Bearer ${token}`
    }
    return headers
  }

  const wsClient = new SubscriptionClient(wsUri, {
    reconnect: true,
    connectionParams: () => {
      return { headers: getHeaders() }
    }
  })
  const wsLink = new WebSocketLink(wsClient)

  const httplink = createHttpLink({
    uri: httpUri
  })

  // eslint-disable-next-line
  const authLink: ApolloLink = setContext((_, { headers }) => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      headers: {
        ...headers,
        ...getHeaders()
      }
    }
  })

  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    wsLink,
    authLink.concat(httplink)
  )

  // eslint-disable-next-line
  const errorLink = onError(
    ({ operation, networkError, graphQLErrors, forward }) => {
      if (
        // eslint-disable-next-line
        networkError?.message?.includes(
          'Missing Authorization header in JWT authentication mode'
        ) ||
        // eslint-disable-next-line
        networkError?.message?.includes('JWSInvalidSignature')
      ) {
        const token = auth?.getJWTToken()
        if (token) {
          // TODO weird TS error
          // const operations: Operations = {...wsClient.operations}
          // const operations = (wsClient.operations as unknown) as Operations
          if (wsClient) {
            wsClient.close(false)
            // .connect()
          }
          // Object.keys(operations).forEach(id => {
          //   ;(wsClient as any).sendMessage(
          //     id,
          //     MessageTypes.GQL_START,
          //     operations[id].options
          //   )
          // })
          // eslint-disable-next-line
          return forward(operation)
        } else {
          console.error(graphQLErrors || networkError)
        }
      }
    }
  )

  auth?.onAuthStateChanged(() => {
    console.log('auth state changed')
    wsClient.close(false)
  })

  const apolloClient = new ApolloClient({
    connectToDevTools: !!process.env.DEV,
    // eslint-disable-next-line
    link: from([errorLink.concat(link)]),
    cache: new InMemoryCache({
      addTypename: true,
      fragmentMatcher
    }),
    defaultOptions: {
      watchQuery: {
        // * See https://medium.com/@galen.corey/understanding-apollo-fetch-policies-705b5ad71980
        fetchPolicy: 'cache-first'
      }
    }
  })

  return apolloClient
}
