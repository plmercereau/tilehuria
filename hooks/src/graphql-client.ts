import { DocumentNode, print } from 'graphql'
import { GraphQLClient } from 'graphql-request'

import { HASURA_ENDPOINT, HASURA_GRAPHQL_ADMIN_SECRET } from './config'

class Client extends GraphQLClient {
  constructor() {
    super(HASURA_ENDPOINT, {
      headers: {
        'x-hasura-admin-secret': HASURA_GRAPHQL_ADMIN_SECRET,
      },
    })
  }
  request<T = any>(
    query: DocumentNode | string,
    variables?: { [key: string]: any } | undefined
  ) {
    const strQuery = typeof query === 'string' ? query : print(query)
    return super.request<T>(strQuery, variables)
  }
}

export const client = new Client()
