<template lang="pug">
  div(id="q-app")
    router-view
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import {
  provideAuth,
  provideStorage,
  useAuth,
  createApolloClient
} from 'src/compositions'
import { provide } from '@vue/composition-api'
import { HASURA_WS_ENDPOINT } from './config'
import { DefaultApolloClient } from '@vue/apollo-composable'

export default defineComponent({
  name: 'App',

  setup() {
    provideAuth()
    provideStorage()
    const auth = useAuth()

    provide(DefaultApolloClient, createApolloClient(HASURA_WS_ENDPOINT, auth))
  }
})
</script>
