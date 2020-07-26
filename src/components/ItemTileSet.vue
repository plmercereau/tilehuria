<template lang="pug">
q-expansion-item(
  v-model='expanded',
  expand-separator,
  icon='perm_identity',
  :label='label',
  caption='John Doe',
  @show='$emit("show")',
  @hide='$emit("hide")'
)
  template(#header)
    q-item-section
      q-item-label(overline) {{ label }}
      q-item-label(v-if='!expanded && tileSet.progress !== 1')
        q-linear-progress.q-mt-md(:value='tileSet.progress')
    q-item-section(side, v-if='!expanded && tileSet.size')
      q-badge {{ tileSet.size | prettyBytes }}
  template(#default)
    q-item
      q-item-section(top)
        q-item-label(overline) Format
        q-item-label
          q-badge {{ tileSet.format }}
      q-item-section(top)
        q-item-label(overline) Quality
        q-item-label(overline) &nbsp;
        q-item-label 
          q-slider(
            :value='tileSet.quality',
            :min='0',
            :max='100',
            label-always,
            readonly
          )
    q-item(v-if='tileSet.size')
      q-item-section
        q-item-label(overline) MBTile file
        q-item-label
          q-badge(v-if='tileSet.progress === 1') {{ tileSet.size | prettyBytes }}
          q-linear-progress.q-mt-md(v-else, :value='tileSet.progress')
      q-item-section(v-if='tileSet.progress === 1')
        q-item-label
          q-btn.q-ma-md(type='a', :href='downloadLink') Download
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from '@vue/composition-api'
import { TileSet } from '../generated'
import '../filters/pretty-bytes'
import { HBP_ENDPOINT } from 'src/config'
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
    const expanded = ref(false)

    const label = computed(() => {
      return props.title === 'areaOfInterest'
        ? props.tileSet.areaOfInterest.name
        : props.tileSet.tileProvider.name
    })

    const downloadLink = computed(() => {
      const {
        areaOfInterest: { name, userId },
        tileProvider: { slug }
      } = props.tileSet
      if (userId)
        return `${HBP_ENDPOINT}/storage/o/mbtiles/${userId}/${slug}/${name}.mbtiles`
    })

    return { label, expanded, downloadLink }
  }
})
</script>
