<template lang="pug">
  q-item(clickable :to="'/tile-sets/'+tileSet.id")
    q-item-section
      q-item-label {{ label }}
    q-item-section(side v-if="tileSet.size")
      q-badge {{tileSet.size}}
    q-item-section(side)
      div {{tileSet.progress}}
      q-linear-progress(:value="tileSet.progress" class="q-mt-md")
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import { TileSet } from '../generated'

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
        : props.tileSet.tileProvider.slug +
            ' - ' +
            props.tileSet.tileProvider.url
    })
    return { label }
  }
})
</script>
