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
      q-item-label(v-if='!expanded && source.progress != 1')
        q-linear-progress.q-mt-md(:value='source.progress')
    q-item-section(
      side,
      v-if='!expanded && source.progress == 1 && source.size'
    )
      q-badge {{ source.size | prettyBytes }}
  template(#default)
    q-item
      q-item-section(top)
        q-item-label(overline) Format
        q-item-label
          q-badge {{ format }}
      q-item-section(top)
        q-item-label(overline) Quality
        q-item-label(overline) &nbsp;
        q-item-label 
          q-slider(
            v-model='quality',
            :min='0',
            :max='100',
            :label-always='!editing',
            :label='editing',
            :readonly='!editing'
          )
    q-item(v-if='source.size')
      q-item-section
        q-item-label(overline) MBTile file
        q-item-label
          q-badge(v-if='source.progress === 1') {{ source.size | prettyBytes }}
          q-linear-progress.q-mt-md(v-else, :value='source.progress')
      q-item-section(v-if='source.progress === 1')
        q-item-label
          q-btn.q-ma-md(type='a', :href='downloadLink') Download
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  toRefs,
  watchEffect
} from '@vue/composition-api'
import { TileSet } from '../generated'
import '../filters/pretty-bytes'
import { HBP_ENDPOINT } from 'src/config'
import { useFormFragment } from 'src/composables'
export default defineComponent({
  name: 'ItemTileSet',
  props: {
    source: {
      type: Object as PropType<TileSet>,
      required: true
    },
    value: {
      type: Object as PropType<TileSet>
    },
    editing: {
      type: Boolean,
      default: false
    },
    expanded: {
      type: Boolean,
      default: false
    }
  },
  setup(props, ctx) {
    const { source, editing } = toRefs(props)
    const {
      fields: { format, quality },
      values: formValue
    } = useFormFragment<TileSet, 'format' | 'quality'>(source, editing, [
      'format',
      'quality'
    ])
    watchEffect(() => {
      console.log('values changed. Emitting...')
      ctx.emit('input', formValue.value)
    })

    const label = computed(() => source.value.areaOfInterest?.name)

    const downloadLink = computed(() => {
      if (source.value) {
        const {
          areaOfInterest: { name, userId },
          tileProvider: { slug }
        } = source.value
        if (userId)
          return `${HBP_ENDPOINT}/storage/o/mbtiles/${userId}/${slug}/${name}.mbtiles`
      }
    })

    return { label, format, quality, downloadLink }
  }
})
</script>
