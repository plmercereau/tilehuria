import { ref, Ref } from '@vue/composition-api'
import { useFormFragment } from './form-fragment'

export const useFormEditor = <T extends Record<string, unknown>>(
  source: Readonly<Ref<Readonly<T | undefined>>> | Ref<Readonly<T>>,
  {
    save
  }: {
    save: (value: T) => Promise<unknown> | unknown
  }
) => {
  const editing = ref(false)

  const { values, reset } = useFormFragment<T>(source, editing)

  const edit = () => {
    editing.value = true
  }

  const _save = async () => {
    try {
      values.value && (await Promise.resolve(save(values.value)))
    } catch (error) {
      console.log('Save failed', error)
    }
    editing.value = false
  }

  const cancel = (): void => {
    editing.value = false
  }

  return { editing, edit, save: _save, cancel, values, reset }
}
