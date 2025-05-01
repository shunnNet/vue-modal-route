import { computed, reactive } from 'vue'
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
      isActive: computed(() => _options.isActive(name)) as unknown as boolean,
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

  /** get modal item */
  function getModalItem(name: string) {
    return ensureModalItem(name)
  }

  /** get modal item unsafe */
  function getModalItemUnsafe(name: string) {
    return modalMap[name]
  }

  /** ensure modal item */
  function ensureModalItem(name: string) {
    if (!modalMap[name]) {
      throw new Error(`Modal route ${name} has not been defined`)
    }
    return modalMap[name]
  }

  /** push modal data */
  function push(name: string, data: Record<string, any>) {
    ensureModalItem(name).data = data
  }

  /** get modal data */
  function get(name: string) {
    return ensureModalItem(name).data
  }

  /** pop modal data */
  function pop(name: string) {
    const modal = ensureModalItem(name)
    const data = modal.data
    modal.data = null
    return data
  }

  /** setup modal options */
  function _setupModal(name: string, options?: TModalMapItem['options']) {
    _setModalOptions(name, options)
    if (options?.manual) {
      setModalLock(name, true)
    }
  }

  /** unset modal */
  function _unsetModal(name: string) {
    const modal = ensureModalItem(name)
    modal.data = null
    _unsetModalOptions(name)
  }

  /** unset modal options */
  function _unsetModalOptions(name: string) {
    const m = ensureModalItem(name)
    m.options = null
    m._settled = false
  }

  /** set modal options */
  function _setModalOptions(name: string, options?: TModalMapItem['options']) {
    const m = ensureModalItem(name)
    if (m._settled) {
      throw new Error(`Modal has ${name} has already been settled.`)
    }
    m.options = options ?? null
    m._settled = true
  }

  /** get modal locked */
  function getModalLocked(name: string) {
    return modalMap[name]._manualLocked
  }

  /** set modal lock */
  function setModalLock(name: string, lock: boolean) {
    if (modalExists(name)) {
      modalMap[name]._manualLocked = lock
    }
  }

  /** unlock modal */
  function unlockModal(name: string) {
    setModalLock(name, false)
  }

  /** set modal return value */
  function setModalReturnValue(name: string, value: any) {
    modalMap[name].returnValue = value
  }

  /** modal exists */
  function modalExists(name: string) {
    return name in modalMap
  }

  // unused
  /** get query modals */
  const getQueryModals = (query: Record<string, any>) => {
    return Object.keys(query).filter(queryKey => modalExists(queryKey))
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
