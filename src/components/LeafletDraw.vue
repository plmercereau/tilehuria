<template lang="pug">
l-control(v-if='centerButton', :position='position')
  button(@click='setCenter') Center
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  onMounted,
  computed,
  ref,
  watch
} from '@vue/composition-api'
import { LMap, LGeoJson } from 'vue2-leaflet'
import 'leaflet-draw'

import L from 'leaflet'
type Position = 'bottomleft' | 'bottomright' | 'topleft' | 'topright'

export default defineComponent({
  name: 'LeafletDraw',
  props: {
    position: {
      type: String, // TODO find a better way to type this prop
      default: 'bottomright'
    },
    readonly: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object as PropType<GeoJSON.GeoJSON>,
      required: false
    },
    autoCenter: {
      type: Boolean,
      default: true
    },
    centerButton: {
      type: Boolean,
      default: true
    }
  },
  setup(props, ctx) {
    const vueMap = ctx.parent as LMap
    const map = vueMap.mapObject
    const vueControl = ref<LGeoJson>(null)

    let drawnItems = ref<L.FeatureGroup>(null)
    let drawControl = ref<L.Control.Draw>(null)

    watch(
      () => props.readonly,
      readonly => {
        if (drawControl.value) {
          if (readonly) map.removeControl(drawControl.value)
          else map.addControl(drawControl.value)
        }
      }
    )

    const setCenter = () => {
      if (props.value) {
        const sourceBounds = L.geoJSON(props.value).getBounds()
        map.fitBounds(sourceBounds, { padding: [80, 80] })
      }
    }

    watch(
      () => props.value,
      (newValue, oldValue) => {
        drawnItems.value?.clearLayers()
        const geo = L.geoJSON(newValue)
        geo.eachLayer(l => {
          drawnItems.value?.addLayer(l)
        })
        // * Center if autocenter is activated and it's the first time the value is loaded
        if (!oldValue && props.autoCenter) setCenter()
      }
    )

    onMounted(() => {
      drawnItems.value = L.featureGroup().addTo(map)
      drawControl.value = new L.Control.Draw({
        position: props.position as Position,
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true
          },
          polyline: false,
          circle: false,
          circlemarker: false,
          marker: false
        },
        edit: {
          featureGroup: drawnItems.value
        }
      })

      map.on(L.Draw.Event.CREATED, event => {
        drawnItems.value?.addLayer(event.layer)
        ctx.emit('input', drawnItems.value?.toGeoJSON())
      })
      map.on(L.Draw.Event.EDITED, () => {
        ctx.emit('input', drawnItems.value?.toGeoJSON())
      })
      map.on(L.Draw.Event.DELETED, event => {
        drawnItems.value?.removeLayer(event.layer)
        ctx.emit('input', drawnItems.value?.toGeoJSON())
      })
    })

    const options = computed(() => {
      return { drawlayer: drawnItems }
    })

    return { vueControl, options, setCenter }
  }
})
</script>