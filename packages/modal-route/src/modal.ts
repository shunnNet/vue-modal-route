import { TModalData, TModalType } from './types'

import type { TDefer } from './helpers'
import { defer } from './helpers'
import { computed, ComputedRef, Ref, ref } from 'vue'

export type TModalRouteOptions = {
  props?: TModalData | ((data: TModalData | null) => TModalData)
  slots?: Record<string, any>
  manual?: boolean
}
export type TModalRouteMeta = {
  direct?: boolean
}

export class ModalRoute {
  public name: string
  public type: TModalType
  public meta: TModalRouteMeta
  private data: Ref<TModalData | null>
  private returnValue: Ref<unknown>
  private _openPromise: TDefer<unknown> | null
  private _settled: boolean
  private locked: Ref<boolean>
  private _options: TModalRouteOptions | null

  private _state: ComputedRef<{
    data: TModalData | null
    returnValue: unknown
    locked: boolean
  }>

  constructor(
    name: string,
    type: TModalType,
    meta: TModalRouteMeta = {},
  ) {
    this.name = name
    this.type = type
    this.meta = meta
    this.data = ref(null)
    this.locked = ref(false)
    this.returnValue = ref(null)
    this._options = null // TODO: options can be moved to visual state
    this._openPromise = null
    this._settled = false
    this._state = computed(() => ({
      data: this.data.value,
      returnValue: this.returnValue.value,
      locked: this.locked.value,
    }))
  }

  get state() {
    return this._state
  }

  get options() {
    return this._options
  }

  activate(data: TModalData) {
    this.data.value = data
    this._openPromise = defer()
    this.returnValue.value = null
    return this._openPromise
  }

  deactivate() {
    this.data.value = null
    if (this._openPromise) {
      this._openPromise._resolve(this.returnValue.value)
      this._openPromise = null
    }
  }

  setOptions(options: TModalRouteOptions) {
    if (this._settled) {
      throw new Error(`Modal has ${this.name} has already been settled.`)
    }
    this._options = options ?? null
    this._settled = true
  }

  unsetOptions() {
    this._options = null
    this._settled = false
  }

  lock() {
    this.locked.value = true
  }

  unlock() {
    this.locked.value = false
  }

  setReturnValue(value: unknown) {
    this.returnValue.value = value
  }

  setData(data: TModalData) {
    this.data.value = data
  }
}
