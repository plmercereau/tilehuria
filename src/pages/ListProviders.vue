<template lang="pug">
  q-page.row.q-pa-md
    q-spinner(v-if="loading" color="primary" size="3em")
    q-list.col-12(v-else bordered separator)
      q-item(v-for="{id, name, url, slug, tileSets_aggregate} of list" :key="id")
        q-item-section
          q-item-label {{ name }}
          q-item-label(caption) {{ url }}
        q-item-section(side) {{ slug }}
        q-item-section(side)
          div.q-gutter-xs
            q-btn(v-if="tileSets_aggregate.aggregate.count === 0" size='12px' flat dense round icon="delete" @click="remove(id)")
    q-page-sticky(position="bottom-right" :offset="[18, 18]")
      q-btn(fab icon="add" color="primary" @click='newProviderDialog = true')
    q-dialog(v-model='newProviderDialog' persistent transition-show='scale' transition-hide='scale')
      p-new-provider(@done="newProviderDialog = false")
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import PNewProvider from 'components/NewProvider.vue'
import { useItemList } from 'src/composables'
import { PROVIDER_CONFIG } from 'src/graphql'

export default defineComponent({
  name: 'ListProviders',
  components: {
    PNewProvider
  },
  setup() {
    const { list, loading, remove } = useItemList(PROVIDER_CONFIG)

    const newProviderDialog = ref(false)

    return { list, loading, remove, newProviderDialog }
  }
})
</script>
