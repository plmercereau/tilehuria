<template lang="pug">
  q-page.row.q-pa-md
    q-spinner(v-if="loading" color="primary" size="3em")
    q-list.col-12(v-else bordered separator)
      p-item-area(v-for="aoi of list" :key="aoi.id" :aoi="aoi")
    q-page-sticky(position="bottom-right" :offset="[18, 18]")
      q-btn(fab icon="add" color="primary" to="/areas-of-interest/new")
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import PItemArea from 'components/ItemAreaOfInterest.vue'
import { AREA_OF_INTEREST_CONFIG } from 'src/config'
import { useItemList } from 'src/composables'

export default defineComponent({
  name: 'ListAreasOfInterest',
  components: {
    PItemArea
  },
  setup() {
    const { list, loading } = useItemList(AREA_OF_INTEREST_CONFIG)

    return { list, loading }
  }
})
</script>
