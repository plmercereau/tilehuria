<template lang="pug">
  q-page.row.items-center.justify-evenly
    q-input(v-model="email" label="login")
    q-input(v-model="password" label="password" type="password")
    q-btn(@click="register") register
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { useAuth } from '../hbp'

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const auth = useAuth()
    const email = ref('')
    const password = ref('')
    const register = async () => {
      try {
        await auth?.register(email.value, password.value)
      } catch (err) {
        console.log(err)
      }
    }
    return { email, password, register }
  }
})
</script>
