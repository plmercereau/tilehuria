<template lang="pug">
  q-page.row.q-pa-md
    q-spinner(v-if="loading" color="primary" size="3em")
    div.row.full-width(v-else)
      div.col-12.col-sm-6.col-md-4
        q-list.q-px-md.q-py-xs(bordered)
          q-item.q-pr-none
            q-item-section(avatar)
              q-tooltip Name
              q-icon( name="label")
            q-item-section
              q-item-label
                q-input(v-model="name" :readonly="!editing" :borderless="!editing" autofocus)
            q-item-section(side)
              q-item-label(:lines="2")
                q-btn(v-if="!editing" size='12px' flat dense round icon="edit" @click="edit")
                q-btn(v-if="editing" size='12px' flat dense round icon="save" @click="save")
                q-btn(v-if="editing" size='12px' flat dense round icon="clear" @click="cancel")
          q-item
            q-item-section(avatar)
              q-tooltip Zoom
              q-icon( name="zoom_in")
            q-item-section
              q-item-label(overline) &nbsp;
              q-item-label
                q-range(v-model="zoomRange"
                  :min="1" :max="19"
                  :label-always="!editing"
                  :label="editing"
                  :steps="1" markers
                  :readonly="!editing"
                  )
          q-item
            q-item-section(avatar)
              q-icon(name="layers")
            q-item-section(v-if="editing") {{ tilesCountEstimate.toLocaleString() }} tiles (estimation)
            q-item-section(v-else) {{ aoi.tilesCount.toLocaleString() }} tiles
          q-separator(spaced)
          q-item.q-pr-none
            q-item-section
              q-item-label(header) Tile sets
            q-item-section(side)
              q-item-label(:lines="2")
                q-btn(size='12px' flat dense round icon="add")
          p-item-tile-set(v-for="set of aoi.tileSets"
            :key="'item'+set.id"
            :tileSet="set"
            @show="select(set)"
            @hide="select(null)"
            :active="selection === set")
        //- div
        //-   q-btn(@click="setCenter") center
      div.col-12.col-sm-6.col-md-8.q-px-xs
        l-map(
            ref="refMap"
            :options="mapOptions"
            style="height: 100%")
          l-tile-layer(:url="url")
          l-tile-layer(v-if="selection" :url="selectionUrl" :options="{errorTileUrl: 'empty-tile.png'}")
          l-geo-json(v-if="aoi" ref="refSource"
            :geojson="aoi.source"
            :options-style="sourceStyle")
        
</template>

<script lang="ts">
// TODO handle the missing tiles in a better way - see the template
import { defineComponent, ref, computed, watch } from '@vue/composition-api'
import { useSubscription, useResult } from '@vue/apollo-composable'
import PItemTileSet from 'components/ItemTileSet.vue'
import { SubscriptionRoot, AreaOfInterest, TileSet } from '../generated'
import { SELECT_AREA_OF_INTEREST } from 'src/graphql'
import { LatLngBounds } from 'leaflet'
import { DEFAULT_TILE_LAYER, HBP_ENDPOINT } from 'src/config'
import { LGeoJson, LMap } from 'vue2-leaflet'
import { useFormEditor } from 'src/compositions'
import { nbTilesEstimation } from 'src/utils'

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
      { id: props.id }
    )
    onError(err => console.warn(err))
    const aoi = useResult<
      SubscriptionRoot,
      undefined,
      AreaOfInterest | undefined
    >(result, undefined, data => data?.areaOfInterest)

    const selection = ref<TileSet>()
    const selectionUrl = computed(
      () =>
        selection.value &&
        `${HBP_ENDPOINT}/storage/o/tile/${selection.value.tileProvider.slug}/{z}/{x}/{y}.png`
    )
    const select = (aoi: TileSet | undefined) => {
      selection.value = aoi
    }

    const refSource = ref<LGeoJson>(null)
    const refMap = ref<LMap>(null)
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

    const mapOptions = { zoomSnap: 0.5 }

    const sourceStyle = computed(() => ({
      weight: 2,
      color: '#ECEFF1',
      opacity: 1,
      fillColor: '#e4ce7f',
      fillOpacity: 0.6
    }))

    const {
      editing,
      save,
      edit,
      cancel,
      fields: { name, source, minZoom, maxZoom }
    } = useFormEditor(aoi, ['name', 'source', 'minZoom', 'maxZoom'], {
      save: async values => {
        console.log('todo save')
        console.log(values)
      }
    })

    const zoomRange = computed({
      get: () => ({ min: minZoom?.value, max: maxZoom?.value }),
      set: val => {
        minZoom.value = val.min
        maxZoom.value = val.max
      }
    })

    const tilesCountEstimate = computed(() => {
      if (source.value) {
        return nbTilesEstimation(
          source.value as GeoJSON.GeoJSON,
          minZoom.value,
          maxZoom.value
        )
      } else return 0
    })

    return {
      select,
      selection,
      selectionUrl,
      refSource,
      refMap,
      aoi,
      tilesCountEstimate,
      loading,
      url,
      mapOptions,
      sourceStyle,
      setCenter,
      editing,
      edit,
      cancel,
      save,
      name,
      zoomRange
    }
  }
})
</script>
