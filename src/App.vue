<template lang="pug">
  div(id="q-app")
    router-view
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { provideAuth, provideStorage } from 'src/hbp'

export default defineComponent({
  name: 'App',

  setup() {
    provideAuth()
    provideStorage()
    return {}
  }
})
</script>
