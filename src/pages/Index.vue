<template lang="pug">
  q-page.row.items-center.justify-evenly
    validation-observer(v-slot="{ handleSubmit, reset }")
      form(@submit.prevent="handleSubmit(register)" @reset.prevent="reset(); resetValues()")
        validation-provider(rules="required|email" name="email" v-slot="{ errors, touched, invalid }")
          q-input(v-model="email" label="email" autofocus
            :error="touched && invalid" :error-message="errors[0]")
        validation-provider(rules="required|min:6" name="password" v-slot="{ errors, touched, invalid }")
          q-input(v-model="password" label="password" type="password" autocomplete="on"
            :error="touched && invalid" :error-message="errors[0]")
        div.text-negative(v-if="serverError") {{ serverError }}
        q-btn(type="submit") Register
        q-btn(type="reset") Reset
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { useAuth } from '../hbp'
import { extend } from 'vee-validate'
import { required, email, min } from 'vee-validate/dist/rules'
extend('email', {
  ...email,
  message: '{_field_} must be an email'
})
extend('required', {
  ...required,
  message: '{_field_} is required'
})
extend('min', {
  ...min,
  message: '{_field_} must have at least {length} characters'
})

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const auth = useAuth()
    const email = ref('')
    const password = ref('')
    const serverError = ref('')
    const register = async () => {
      try {
        await auth?.register(email.value, password.value)
      } catch (err) {
        serverError.value = err as string
      }
    }
    const resetValues = () => {
      email.value = ''
      password.value = ''
      serverError.value = ''
    }
    return { email, password, register, resetValues, serverError }
  }
})
</script>
