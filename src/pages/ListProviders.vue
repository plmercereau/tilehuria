<template lang="pug">
  q-page.row.q-pa-md
    q-spinner(v-if="loading" color="primary" size="3em")
    q-list.col-12(v-else bordered separator)
      q-item(v-for="{id, name, url, slug, tileSets_aggregate} of providers" :key="id")
        q-item-section(avatar v-if="tileSets_aggregate.aggregate.count === 0")
          q-btn(size='xs' round icon="clear" color="negative")
        q-item-section
          q-item-label {{ name }}
          q-item-label(caption) {{ url }}
        q-item-section(side) {{ slug }}
    q-page-sticky(position="bottom-right" :offset="[18, 18]")
      q-btn(fab icon="add" color="primary" @click='newProviderDialog = true')
    q-dialog(v-model='newProviderDialog' persistent transition-show='scale' transition-hide='scale')
      p-new-provider(@done="newProviderDialog = false")
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { useQuery, useResult } from '@vue/apollo-composable'

import PNewProvider from 'components/NewProvider.vue'

import { QueryRoot, TileProvider } from 'src/generated'
import { PROVIDERS } from 'src/graphql'

export default defineComponent({
  name: 'ListProviders',
  components: {
    PNewProvider
  },
  setup() {
    const { result, loading, onError } = useQuery<QueryRoot>(PROVIDERS)
    const providers = useResult<QueryRoot, [], TileProvider[]>(
      result,
      [],
      data => data.tileProviders
    )
    onError(err => {
      console.log(err)
    })
    const newProviderDialog = ref(false)
    return { providers, loading, newProviderDialog }
  }
})
</script>
