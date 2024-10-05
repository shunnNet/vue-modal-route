import { reactive } from 'vue'
import { TModalMapItem } from './types'
import { defer } from './helpers'

// todo: direct need decide by option.direct or meta.direct
export const createModalStore = () => {
  const modalMap = reactive<Record<string, TModalMapItem>>({})

  function registerModal(
    name: string,
    type: TModalMapItem['type'],
    _options: Record<string, any> = {},
  ) {
    if (modalMap[name]) {
      throw new Error(`Modal route ${name} has already been defined`)
    }
    modalMap[name] = {
      name,
      data: null,
      returnValue: null,
      options: null,
      type,
      direct: _options.direct,
      isActive: _options.isActive,
      activate(name, data) {
        push(name, data)
        modalMap[name]._openPromise = defer()
        return modalMap[name]._openPromise
      },
      open: (name, options?: {
        query?: Record<string, any>
        hash?: string
        params?: Record<string, any>
      }) => {
        return _options.open(name, options)
      },
      close: (name, returnValue) => {
        setModalReturnValue(name, returnValue)
        if (modalMap[name]._openPromise) {
          modalMap[name]._openPromise._resolve(returnValue)
        }
        _unsetModal(name)
      },
      findBase: () => _options.findBase(name),
      _manualLocked: false,
      _openPromise: null,
      _openPosition: -1,
    }
  }

  function ensureModalItem(name: string) {
    if (!modalMap[name]) {
      throw new Error(`Modal route ${name} has not been defined`)
    }
    return modalMap[name]
  }
  function push(name: string, data: Record<string, any>) {
    ensureModalItem(name).data = data
  }
  function getModalItem(name: string) {
    return ensureModalItem(name)
  }
  function getModalItemUnsafe(name: string) {
    return modalMap[name]
  }
  function _setupModal(name: string, options: TModalMapItem['options']) {
    ensureModalItem(name).options = options
    if (options?.manual) {
      setModalLock(name, true)
    }
  }
  // TODO: remove this?
  function _unsetModal(name: string) {
    const modal = ensureModalItem(name)
    modal.data = null
    modal.options = null
  }
  function setModalLock(name: string, lock: boolean) {
    if (modalExists(name)) {
      modalMap[name]._manualLocked = lock
    }
  }
  function unlockModal(name: string) {
    setModalLock(name, false)
  }
  function setModalReturnValue(name: string, value: any) {
    modalMap[name].returnValue = value
  }

  function modalExists(name: string) {
    return name in modalMap
  }
  const getQueryModals = (query: Record<string, any>) => {
    return Object.keys(query).filter(queryKey => modalExists(queryKey))
  }
  function getModalLocked(name: string) {
    return modalMap[name]._manualLocked
  }
  function get(name: string) {
    // console.log(name)
    return ensureModalItem(name).data
  }
  function pop(name: string) {
    // console.log(name)
    return ensureModalItem(name).data
  }

  return {
    modalMap,
    registerModal,
    get,
    pop,
    push,
    getModalItem,
    getModalItemUnsafe,
    _setupModal,
    _unsetModal,
    unlockModal,
    setModalReturnValue,
    modalExists,
    getQueryModals,
    getModalLocked,
  }
}
