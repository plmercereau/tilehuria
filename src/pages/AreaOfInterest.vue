<template lang="pug">
  q-page.row.q-pa-md
    div(v-if="loading") Loading...
    q-list.col-12.q-px-md.q-py-xs(v-else bordered)
      q-field(label="Name" stack-label)
        template(#control) {{aoi.name}}
      q-field(label="Type" stack-label)
        template(#control) {{type}}
      q-field(label="Tiles" stack-label)
        template(#control) {{aoi.tilesCount}}
      q-field(label="Tile sets" stack-label)
        template(#control)
          q-list.col-12(separator)
            q-item-tile-set(v-for="set of aoi.tileSets" :key="set.id" :tileSet="set")
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { useSubscription, useResult } from '@vue/apollo-composable'
import QItemTileSet from 'components/ItemTileSet.vue'
import { GeoJSON } from 'GeoJSON'
import { SubscriptionRoot, AreaOfInterest } from '../generated'
import { SELECT_AREA_OF_INTEREST } from 'src/graphql'

export default defineComponent({
  name: 'AreaOfInterest',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  components: {
    QItemTileSet
  },
  setup(props) {
    const { result, loading, onError } = useSubscription<SubscriptionRoot>(
      SELECT_AREA_OF_INTEREST,
      {
        id: props.id
      }
    )
    onError(err => {
      console.warn(err)
    })
    const aoi = useResult<
      SubscriptionRoot,
      undefined,
      AreaOfInterest | undefined
    >(result, undefined, data => data.areaOfInterest)
    const source = computed(() => aoi.value?.source as GeoJSON)
    const type = computed(() => source.value?.type)
    return { aoi, loading, type }
  }
})
</script>