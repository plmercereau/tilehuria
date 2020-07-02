import { provide, InjectionKey, inject } from '@vue/composition-api'

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
