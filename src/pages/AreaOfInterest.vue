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
      div.col-12.col-sm-6.col-md-8.q-px-xs
        l-map(:options="mapOptions" style="height: 100%")
          p-leaflet-draw(v-model="source" :readonly="!editing")
          l-tile-layer(:url="url")
          l-tile-layer(v-if="selection" :url="selectionUrl" :options="{errorTileUrl: 'empty-tile.png'}") 
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from '@vue/composition-api'
import { useSubscription, useResult, useMutation } from '@vue/apollo-composable'
import PItemTileSet from 'components/ItemTileSet.vue'
import PLeafletDraw from 'components/LeafletDraw.vue'
import {
  SubscriptionRoot,
  AreaOfInterest,
  TileSet,
  MutationRoot
} from '../generated'
import { SELECT_AREA_OF_INTEREST, UPDATE_AREA_OF_INTEREST } from 'src/graphql'
import { LatLngBounds, Control } from 'leaflet'
import L from 'leaflet'
import 'leaflet-draw'
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
    PItemTileSet,
    PLeafletDraw
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

    const url = DEFAULT_TILE_LAYER

    const mapOptions = { zoomSnap: 0.5 }
    const { mutate, onError: onSaveError, onDone } = useMutation<MutationRoot>(
      UPDATE_AREA_OF_INTEREST,
      () => ({
        variables: { id: props.id, ...values.value }
      })
      // TODO update cache
    )
    const {
      editing,
      save,
      edit,
      cancel,
      fields: { name, source, minZoom, maxZoom },
      values
    } = useFormEditor(aoi, ['name', 'source', 'minZoom', 'maxZoom'], {
      save: async () => {
        await mutate()
      }
    })
    onDone(() => {
      console.log('saved')
    })
    onSaveError(error => console.log('save error', error))

    const zoomRange = computed({
      get: () => ({ min: minZoom?.value, max: maxZoom?.value }),
      set: val => {
        minZoom.value = val.min
        maxZoom.value = val.max
      }
    })

    const tilesCountEstimate = computed(() => {
      if (source.value) {
        return (
          nbTilesEstimation(
            source.value as GeoJSON.GeoJSON,
            minZoom.value,
            maxZoom.value
          ) || 0
        )
      } else return 0
    })

    return {
      select,
      selection,
      selectionUrl,
      aoi,
      tilesCountEstimate,
      loading,
      url,
      mapOptions,
      editing,
      edit,
      cancel,
      save,
      name,
      source,
      zoomRange
    }
  }
})
</script>
