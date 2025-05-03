import { TModalType } from './types'
import { ModalRoute } from './modal'

// todo: direct need decide by option.direct or meta.direct
export const createModalStore = () => {
  const modalMap: Record<string, ModalRoute> = {}

  function registerModal(
    name: string,
    type: TModalType,
    _options: Record<string, any> = {},
  ) {
    if (modalMap[name]) {
      throw new Error(`Modal route ${name} has already been defined`)
    }
    modalMap[name] = new ModalRoute(
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
    return modalMap[name]
  }

  /** get modal item unsafe */
  function getModalItemUnsafe(name: string): ModalRoute | undefined {
    return modalMap[name]
  }

  /** modal exists */
  function modalExists(name: string) {
    return name in modalMap
  }

  return {
    modalMap,
    register: registerModal,
    get: getModalItem,
    getUnsafe: getModalItemUnsafe,
    exists: modalExists,
  }
}
