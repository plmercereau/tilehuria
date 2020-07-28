<template lang="pug">
  q-page.row.q-pa-md
    q-spinner(v-if="loading" color="primary" size="3em")
    q-list.col-12(v-else bordered separator)
      p-item-area(v-for="aoi of areas" :key="aoi.id" :aoi="aoi")
    q-page-sticky(position="bottom-right" :offset="[18, 18]")
      q-btn(fab icon="add" color="primary" to="/areas-of-interest/new")
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { useQuery, useResult } from '@vue/apollo-composable'
import PItemArea from 'components/ItemAreaOfInterest.vue'
import { AREA_OF_INTEREST_CONFIG } from 'src/graphql'

import { QueryRoot, AreaOfInterest } from '../generated'
export default defineComponent({
  name: 'ListAreasOfInterest',
  components: {
    PItemArea
  },
  setup() {
    const { result, loading } = useQuery<QueryRoot>(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      AREA_OF_INTEREST_CONFIG.list!
    )
    const areas = useResult<QueryRoot, AreaOfInterest[], AreaOfInterest[]>(
      result,
      [],
      data => data.areasOfInterest
    )

    return { areas, loading }
  }
})
</script>
