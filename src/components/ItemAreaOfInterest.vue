<template lang="pug">
  q-item(clickable :to="'/areas-of-interest/'+aoi.id")
    q-item-section
      q-item-label {{ title }}
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import { AreaOfInterest } from '../generated'

export default defineComponent({
  name: 'ItemAreaOfInterest',
  props: {
    aoi: {
      type: Object as PropType<AreaOfInterest>,
      required: true
    }
  },
  setup(props) {
    const title = computed(() => {
      return props.aoi.name || props.aoi.id
    })
    return { title }
  }
})
</script>
