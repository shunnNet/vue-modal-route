import type { TModalType } from '../types'
import { ModalRoute } from './ModalRoute'

// todo: direct need decide by option.direct or meta.direct
export const createModalRouteStore = () => {
  const store: Record<string, ModalRoute> = {}

  function register(
    name: string,
    type: TModalType,
    _options: Record<string, any> = {},
  ) {
    if (store[name]) {
      throw new Error(`Modal route ${name} has already been defined`)
    }
    store[name] = new ModalRoute(
      name,
      type,
      _options,
    )
  }

  /** get modal item */
  function getModalItem(name: string) {
    if (!modalExists(name)) {
      throw new Error(`Modal route ${name} has not been defined`)
    }
    return store[name]
  }

  /** get modal item unsafe */
  function getModalItemUnsafe(name: string): ModalRoute | undefined {
    return store[name]
  }

  /** modal exists */
  function modalExists(name: string) {
    return name in store
  }

  return {
    modalMap: store,
    register,
    get: getModalItem,
    getUnsafe: getModalItemUnsafe,
    exists: modalExists,
  }
}
