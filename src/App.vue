<template lang="pug">
  div(id="q-app")
    router-view
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { provideAuth, provideStorage, useAuth } from 'src/compositions'
import { provide } from '@vue/composition-api'
import { HASURA_ENDPOINT } from './config'
import { DefaultApolloClient } from '@vue/apollo-composable'
import ApolloClient from 'apollo-boost'

export default defineComponent({
  name: 'App',

  setup() {
    provideAuth()
    provideStorage()
    const auth = useAuth()
    const apolloClient = new ApolloClient({
      uri: HASURA_ENDPOINT,
      request: operation => {
        const token = auth?.getJWTToken()
        operation.setContext({
          headers: {
            authorization: token ? `Bearer ${token}` : ''
          }
        })
      }
    })
    provide(DefaultApolloClient, apolloClient)
  }
})
</script>
