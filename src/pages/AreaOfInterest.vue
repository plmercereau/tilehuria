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
                q-input(v-model="name" :readonly="!editing" :borderless="!editing" placeholder="Name" autofocus)
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
            q-item-section(v-else) {{ item.tilesCount.toLocaleString() }} tiles
          q-separator(spaced)
          q-item.q-pr-none
            q-item-section
              q-item-label(header) Tile sets
            q-item-section(side)
              q-item-label(:lines="2")
                q-btn(size='12px' flat dense round icon="add")
          p-item-tile-set(v-for="set of item.tileSets"
            :key="'item'+set.id"
            :tileSet="set"
            @show="select(set)"
            @hide="select(null)"
            :active="selection === set")
      div.col-12.col-sm-6.col-md-8.q-px-xs
        l-map(:options="{ zoomSnap: 0.5 }" style="height: 100%" :zoom="2")
          p-leaflet-draw(v-model="source" :readonly="!editing")
          l-tile-layer(:url="url")
          l-tile-layer(v-if="selection" :url="selectionUrl" :options="{errorTileUrl: 'empty-tile.png'}") 
</template>

<script lang="ts">
import { defineComponent, ref, computed } from '@vue/composition-api'
import PItemTileSet from 'components/ItemTileSet.vue'
import PLeafletDraw from 'components/LeafletDraw.vue'
import { AreaOfInterest, TileSet } from '../generated'
import { SELECT_AREA_OF_INTEREST, UPDATE_AREA_OF_INTEREST } from 'src/graphql'
import { DEFAULT_TILE_LAYER, HBP_ENDPOINT } from 'src/config'
import { useSingleItemSubscription } from 'src/compositions'
import { nbTilesEstimation } from 'src/utils'

const defaultAreaOfInterest: Partial<AreaOfInterest> = {
  name: '',
  tileSets: [],
  tilesCount: 0,
  minZoom: 1,
  maxZoom: 19
}

export default defineComponent({
  name: 'AreaOfInterest',
  props: {
    id: {
      type: String
    }
  },
  components: {
    PItemTileSet,
    PLeafletDraw
  },
  setup(props) {
    const {
      item,
      onLoadError,
      loading,
      onSaved,
      onSaveError,
      editing,
      edit,
      cancel,
      save,
      fields: { minZoom, maxZoom, source, name }
    } = useSingleItemSubscription({
      query: SELECT_AREA_OF_INTEREST,
      update: UPDATE_AREA_OF_INTEREST,
      properties: ['name', 'source', 'minZoom', 'maxZoom'],
      defaults: defaultAreaOfInterest,
      id: () => props.id
    })

    const selection = ref<TileSet>()
    const select = (tileSet?: TileSet) => {
      selection.value = tileSet
    }
    const selectionUrl = computed(
      () =>
        selection.value &&
        `${HBP_ENDPOINT}/storage/o/tile/${selection.value.tileProvider.slug}/{z}/{x}/{y}.png`
    )

    const url = DEFAULT_TILE_LAYER

    onLoadError(err => console.warn(err))
    onSaved(() => console.log('saved'))
    onSaveError(error => console.log('save error', error))

    const zoomRange = computed({
      get: () => ({ min: minZoom.value, max: maxZoom.value }),
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
      item,
      tilesCountEstimate,
      loading,
      url,
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
