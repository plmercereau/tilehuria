<template lang="pug">
  q-page.row.q-pa-md
    div(v-if="loading") Loading...
    q-list.col-12(v-else bordered separator)
      q-item(v-for="{id, name} of providers" :key="id")
        q-item-section
          q-item-label {{ name }}
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { useQuery, useResult } from '@vue/apollo-composable'

import { QueryRoot, TileProvider } from 'src/generated'
import { PROVIDERS } from 'src/graphql'

export default defineComponent({
  name: 'ListProviders',
  setup() {
    const { result, loading } = useQuery<QueryRoot>(PROVIDERS)
    const providers = useResult<QueryRoot, [], TileProvider[]>(
      result,
      [],
      data => data.tileProviders
    )

    return { providers, loading }
  }
})
</script>
