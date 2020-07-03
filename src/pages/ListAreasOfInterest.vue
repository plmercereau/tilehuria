<template lang="pug">
  q-page.row.q-pa-md
    div(v-if="loading") Loading...
    q-list(v-else)
      q-item-area(v-for="aoi of areas" :key="aoi.id" :aoi="aoi")
    q-page-sticky(position="bottom-right" :offset="[18, 18]")
      q-btn(fab icon="add" to="/areas-of-interest/new")
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { useQuery, useResult } from '@vue/apollo-composable'
import QItemArea from 'components/ItemAreaOfInterest.vue'
import { AREAS_OF_INTEREST } from 'src/graphql'

import { QueryRoot, AreaOfInterest } from '../generated'
export default defineComponent({
  name: 'ListAreasOfInterest',
  components: {
    QItemArea
  },
  setup() {
    const { result, loading } = useQuery<QueryRoot>(AREAS_OF_INTEREST)
    const areas = useResult<QueryRoot, AreaOfInterest[], AreaOfInterest[]>(
      result,
      [],
      data => data.areasOfInterest
    )

    return { areas, loading }
  }
})
</script>
