<template lang="pug">
q-page.row.q-pa-md
  validation-observer(v-slot='{ handleSubmit, reset }')
    form(
      @submit.prevent='handleSubmit(create)',
      @reset.prevent='reset(); resetForm()'
    )
      validation-provider(
        rules='required|min:3',
        name='name',
        v-slot='{ errors, touched, invalid }'
      )
        q-input(
          v-model='name',
          label='Name',
          autofocus,
          :error='touched && invalid',
          :error-message='errors[0]'
        )
      validation-provider(
        rules='required',
        name='source',
        v-slot='{ errors, touched, invalid }'
      )
        q-input(
          v-model='source',
          label='Source',
          :error='touched && invalid',
          :error-message='errors[0]'
        )
      .text-negative(v-if='error') {{ error }}
      q-btn(type='submit') Create
      q-btn(type='reset') Reset
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { useMutation } from '@vue/apollo-composable'
import { extend } from 'vee-validate'
import { required, min } from 'vee-validate/dist/rules'
import { MutationRoot, QueryRoot } from 'src/generated'
import { AREAS_OF_INTEREST, INSERT_AREA_OF_INTEREST } from 'src/graphql'

extend('min', {
  ...min,
  message: '{_field_} must have at least {length} characters'
})
extend('required', {
  ...required,
  message: '{_field_} is required'
})

export default defineComponent({
  name: 'NewAreaOfInterest',
  setup(_, { root: { $router } }) {
    const name = ref('')
    const source = ref('')
    const error = ref('')
    const { mutate: create, onError, onDone } = useMutation<MutationRoot>(
      INSERT_AREA_OF_INTEREST,
      () => ({
        variables: {
          name: name.value,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          source: JSON.parse(source.value)
        },
        update: (cache, { data }) => {
          const areaOfInterest = data?.insertAreaOfInterest
          if (areaOfInterest) {
            const list = cache.readQuery<QueryRoot>({
              query: AREAS_OF_INTEREST
            })
            list?.areasOfInterest.push(areaOfInterest)
            cache.writeQuery({
              query: AREAS_OF_INTEREST,
              data: {
                areasOfInterest: list?.areasOfInterest.sort((a, b) =>
                  a.name.toLowerCase() > b.name.toLowerCase()
                    ? 1
                    : a.name.toLowerCase() === b.name.toLowerCase()
                    ? 0
                    : -1
                )
              }
            })
          }
        }
      })
    )
    onError(err => {
      error.value = JSON.stringify(err)
    })
    onDone(res => {
      const id = res?.data?.insertAreaOfInterest?.id
      if (id) void $router.push(`/areas-of-interest/${id}`)
      else error.value = 'Error in retreiving the object id'
    })

    const resetForm = () => {
      error.value = ''
      name.value = ''
      source.value = ''
    }
    return { name, source, error, resetForm, create }
  }
})
</script>
