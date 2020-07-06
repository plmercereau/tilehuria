<template lang="pug">
  q-item(clickable :to="'/tile-sets/'+tileSet.id")
    q-item-section
      q-item-label {{ label }}
      q-item-label
        q-linear-progress.q-mt-md(v-if="tileSet.progress !== 1" :value="tileSet.progress")
    q-item-section(side v-if="tileSet.size")
      q-badge {{tileSet.size | prettyBytes}}
      
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import { TileSet } from '../generated'
import '../filters/pretty-bytes'
export default defineComponent({
  name: 'ItemTileSet',
  props: {
    tileSet: {
      type: Object as PropType<TileSet>,
      required: true
    },
    title: {
      type: String as PropType<'areaOfInterest' | 'tileProvider'>,
      default: 'tileProvider'
    }
  },
  setup(props) {
    const label = computed(() => {
      return props.title === 'areaOfInterest'
        ? props.tileSet.areaOfInterest.name
        : props.tileSet.tileProvider.name
    })
    return { label }
  }
})
</script>
