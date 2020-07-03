<template lang="pug">
  q-page.row.q-pa-md
    div(v-if="loading") Loading...
    q-list(v-else)
      q-item(v-for="{id, slug, url} of providers" :key="id")
        q-item-section
          q-item-label {{ slug }} - {{ url }}
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import gql from 'graphql-tag'
import { useQuery, useResult } from '@vue/apollo-composable'

import { QueryRoot, TileProvider } from '../generated'
export default defineComponent({
  name: 'ListProviders',
  setup() {
    const { result, loading } = useQuery<QueryRoot>(gql`
      query list {
        tileProviders {
          id
          slug
          url
        }
      }
    `)
    const providers = useResult<QueryRoot, [], TileProvider[]>(
      result,
      [],
      data => data.tileProviders
    )

    return { providers, loading }
  }
})
</script>
