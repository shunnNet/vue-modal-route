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
        modalMap[name].returnValue = null
        return modalMap[name]._openPromise
      },
      deactivate: () => {
        modalMap[name].data = null
        if (modalMap[name]._openPromise) {
          modalMap[name]._openPromise._resolve(modalMap[name].returnValue)
          modalMap[name]._openPromise = null
        }
      },
      findBase: options => _options.findBase(name, options?.params ?? {}),
      _manualLocked: false,
      _openPromise: null,
      _openPosition: -1,
      _settled: false,
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
  function _setupModal(name: string, options?: TModalMapItem['options']) {
    _setModalOptions(name, options)
    if (options?.manual) {
      setModalLock(name, true)
    }
  }
  function _unsetModal(name: string) {
    const modal = ensureModalItem(name)
    modal.data = null
    _unsetModalOptions(name)
  }
  function _setModalOptions(name: string, options?: TModalMapItem['options']) {
    const m = ensureModalItem(name)
    if (m._settled) {
      throw new Error(`Modal has ${name} has already been settled.`)
    }
    m.options = options ?? null
    m._settled = true
  }
  function _unsetModalOptions(name: string) {
    const m = ensureModalItem(name)
    m.options = null
    m._settled = false
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
    return ensureModalItem(name).data
  }
  function pop(name: string) {
    const modal = ensureModalItem(name)
    const data = modal.data
    modal.data = null
    return data
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
    _unsetModalOptions,
    unlockModal,
    setModalReturnValue,
    modalExists,
    getQueryModals,
    getModalLocked,
    setModalLock,
  }
}
