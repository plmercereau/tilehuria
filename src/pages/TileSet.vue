<template lang="pug">
  q-page.row.q-pa-md
    div(v-if="loading") Loading...
    q-list(v-else)
      q-field(label="Area of Interest" stack-label)
        template(#control) {{tileSet.areaOfInterest.name}}
      q-field(label="Provider" stack-label)
        template(#control) {{tileSet.tileProvider.slug}}
      q-field(label="Format" stack-label)
        template(#control) {{tileSet.format}}
      q-field(label="Quality" stack-label)
        template(#control) {{tileSet.quality}}
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { useQuery, useResult } from '@vue/apollo-composable'
import QItemTileSet from 'components/ItemTileSet.vue'
import { GeoJSON } from 'GeoJSON'
import { QueryRoot, TileSet } from '../generated'
import { SELECT_TILE_SET } from 'src/graphql'

export default defineComponent({
  name: 'TileSet',
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
    const { result, loading } = useQuery<QueryRoot>(SELECT_TILE_SET, {
      id: props.id
    })
    const tileSet = useResult<QueryRoot, undefined, TileSet | undefined>(
      result,
      undefined,
      data => data.tileSet
    )
    return { tileSet, loading }
  }
})
</script>
