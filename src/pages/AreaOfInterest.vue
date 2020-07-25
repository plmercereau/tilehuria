<template lang="pug">
  q-page.row.q-pa-md
    q-spinner(v-if="loading" color="primary" size="3em")
    div.row.full-width(v-else)
      div.col-12.col-sm-6
        q-list.q-px-md.q-py-xs(bordered)
          q-field(label="Name" stack-label)
            template(#control) {{aoi.name}}
          //- q-field(label="Type" stack-label)
            template(#control) {{type}}
          q-field(label="Tiles" stack-label)
            template(#control) {{aoi.tilesCount}}
          q-field(label="Tile sets" stack-label)
            template(#control)
              q-list.col-12(separator)
                p-item-tile-set(v-for="set of aoi.tileSets" :key="set.id" :tileSet="set")
        div
          div {{zoom}}
          div {{bounds}}
          q-btn(@click="setCenter") center
      l-map.col-12.col-sm-6(
          ref="refMap"
          :options="mapOptions"
          style="height: 100%")
        l-tile-layer(:url="url")
        l-geo-json(ref="refSource"
          :geojson="aoi.source"
          :options-style="sourceStyle")
        
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from '@vue/composition-api'
import { useSubscription, useResult } from '@vue/apollo-composable'
import PItemTileSet from 'components/ItemTileSet.vue'
import { SubscriptionRoot, AreaOfInterest } from '../generated'
import { SELECT_AREA_OF_INTEREST } from 'src/graphql'
import { LatLngBounds, LatLng } from 'leaflet'
import { DEFAULT_TILE_LAYER } from 'src/config'
import { LGeoJson, LMap } from 'vue2-leaflet'

export default defineComponent({
  name: 'AreaOfInterest',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  components: {
    PItemTileSet
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
    >(result, undefined, data => {
      return data?.areaOfInterest
    })

    const refSource = ref<LGeoJson>(null)
    const refMap = ref<LMap>(null)
    // const zoom = ref(0)
    // const bounds = ref<LatLngBounds>()
    // const center = ref<LatLng>()
    // const updateZoom = (newZoom: number) => {
    //   console.log('update zoom', newZoom)
    //   zoom.value = newZoom
    // }
    // const updateBounds = (newBounds: LatLngBounds) => {
    //   console.log('update bounds')
    //   bounds.value = newBounds
    // }
    // const updateCenter = (newCenter: LatLng) => {
    //   center.value = newCenter
    // }
    const setCenter = () => {
      if (aoi.value?.source && refSource.value) {
        console.log('Center to the area of interest')
        const map = refMap.value
        const sourceBounds = (refSource.value.getBounds() as unknown) as LatLngBounds
        map?.mapObject.fitBounds(sourceBounds, { padding: [80, 80] })
      }
    }

    watch(() => aoi.value?.source && refSource.value, setCenter)
    const url = DEFAULT_TILE_LAYER

    const mapOptions = {
      zoomSnap: 0.5
    }

    const sourceStyle = computed(() => {
      return () => {
        return {
          weight: 2,
          color: '#ECEFF1',
          opacity: 1,
          fillColor: '#e4ce7f',
          fillOpacity: 0.6
        }
      }
    })
    return {
      refSource,
      refMap,
      aoi,
      loading,
      url,
      mapOptions,
      sourceStyle,
      setCenter
    }
  }
})
</script>
