import { ref, Ref } from '@vue/composition-api'
import { useFormFragment } from './form-fragment'

export const useFormEditor = <T, V extends keyof T = keyof T>(
  source: Readonly<Ref<Readonly<T> | undefined>>,
  fieldNames: V[],
  {
    save
  }: {
    save: (value: Record<V, unknown>) => Promise<unknown> | unknown
  }
) => {
  const editing = ref(false)

  const { fields, reset, values } = useFormFragment<T>(
    source,
    editing,
    fieldNames
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
