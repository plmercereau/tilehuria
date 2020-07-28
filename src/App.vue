<template lang="pug">
#q-app
  router-view
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import {
  provideAuth,
  provideStorage,
  useAuth,
  createApolloClient
} from 'src/composables'
import { provide } from '@vue/composition-api'
import { HASURA_HTTP_ENDPOINT } from './config'
import { DefaultApolloClient } from '@vue/apollo-composable'

export default defineComponent({
  name: 'App',

  setup() {
    provideAuth()
    provideStorage()
    const auth = useAuth()

    provide(DefaultApolloClient, createApolloClient(HASURA_HTTP_ENDPOINT, auth))
  }
})
</script>
