import {
  provide,
  InjectionKey,
  inject,
  ref,
  computed
} from '@vue/composition-api'

import nhost from 'nhost-js-sdk'
import Auth from 'nhost-js-sdk/dist/Auth'
import Storage from 'nhost-js-sdk/dist/Storage'
const config = {
  base_url: 'http://localhost:3000'
}

nhost.initializeApp(config)

const AuthSymbol: InjectionKey<Auth> = Symbol()
const StorageSymbol: InjectionKey<Storage> = Symbol()

export function provideAuth() {
  provide(AuthSymbol, nhost.auth())
}

export function provideStorage() {
  provide(StorageSymbol, nhost.storage())
}

export const useAuth = () => inject(AuthSymbol)
export const useStorage = () => inject(StorageSymbol)

export const useConnectionStatus = () => {
  const auth = useAuth()
  const status = ref(!!auth?.isAuthenticated())
  if (auth) {
    auth.onAuthStateChanged(() => {
      status.value = !!auth.isAuthenticated()
    })
  }
  return computed(() => status.value)
}
