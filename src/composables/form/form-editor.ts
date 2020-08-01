import { ref, Ref } from '@vue/composition-api'
import { useFormFragment } from './form-fragment'
import { FieldDefinition } from 'src/utils'

export const useFormEditor = <
  T extends Record<string, unknown>,
  U = Record<keyof T, FieldDefinition>,
  V = Record<keyof T, unknown>
>(
  source: Readonly<Ref<Readonly<T> | undefined>>,
  definitions: U,
  {
    save
  }: {
    save: (value: T) => Promise<unknown> | unknown
  }
) => {
  const editing = ref(false)

  const { fields, reset, values } = useFormFragment<T, U, V>(
    source,
    editing,
    definitions
  )

  const edit = () => {
    editing.value = true
  }

  const _save = async () => {
    try {
      await Promise.resolve(save(values.value))
    } catch (error) {
      console.log('Save failed', error)
    }
    editing.value = false
  }

  const cancel = (): void => {
    editing.value = false
  }

  return { editing, edit, save: _save, cancel, values, fields, reset }
}
