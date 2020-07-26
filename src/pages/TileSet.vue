<template lang="pug">
q-page.row.q-pa-md
  q-spinner(v-if='loading', color='primary', size='3em')
  .col-12(v-else)
    q-field(label='Area of Interest', stack-label)
      template(#control) {{ tileSet.areaOfInterest.name }}
    q-field(label='Provider', stack-label)
      template(#control) {{ tileSet.tileProvider.name }}
    q-field(label='Format', stack-label)
      template(#control) {{ tileSet.format }}
    q-field(label='Quality', stack-label)
      template(#control) {{ tileSet.quality }}
    q-field(label='Size', stack-label)
      template(#control) {{ tileSet.size | prettyBytes }}
    q-btn.q-ma-md(
      v-if='tileSet.progress === 1',
      type='a',
      :href='downloadLink'
    ) Download
    q-btn.q-ma-md(v-if='tileSet.progress === 1') Edit
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { useQuery, useResult } from '@vue/apollo-composable'
import QItemTileSet from 'components/ItemTileSet.vue'

import 'src/filters/pretty-bytes'
import { QueryRoot, TileSet } from 'src/generated'
import { SELECT_TILE_SET } from 'src/graphql'
import { HBP_ENDPOINT } from 'src/config'

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
    const downloadLink = computed(() => {
      if (tileSet.value) {
        const {
          areaOfInterest: { name, userId },
          tileProvider: { slug }
        } = tileSet.value
        if (userId)
          // TODO change userId in gql schema: not null
          return `${HBP_ENDPOINT}/storage/o/mbtiles/${userId}/${slug}/${name}.mbtiles`
      }
    })
    return { tileSet, loading, downloadLink }
  }
})
</script>
