import { Component, InjectionKey } from 'vue'
import { NavigationFailure, RouteLocationRaw, RouteRecordRaw, RouteRecordSingleViewWithChildren } from 'vue-router'
import { Rejection } from './rejection'
import { TDefer } from './helpers'

export type TModalMapItem = {
  name: string
  data: Record<string, any> | null
  type: 'hash' | 'query' | 'path' | string

  /**
   * Allow enter when init navigation
   */
  direct?: boolean

  propInitiated: boolean
  _manualLocked: boolean
  returnValue: unknown
  _openPromise: TDefer<unknown> | null
  _openPosition: number
  isActive: (name: string) => boolean
  activate: (name: string, data: Record<string, any>) => TDefer<unknown>
  open: (name: string, options?: {
    query?: Record<string, any>
    hash?: string
    params?: Record<string, any>
  }) => Promise<void>
  close: (name: string, returnValue: unknown) => void
  findBase: () => { path: string } & Record<string, any>

  options: {
    props?: {
      handler: (
        data: Record<string, any> | null
      ) => Record<string, any> | Rejection
    } | Record<string, any>
    slots?: Record<string, any>
    manual?: boolean
  } | null
}
export type TModalMapPush = (name: string, data: Record<string, any>) => void
export type TModalMapPop = (name: string) => TModalMapItem['data']
export type TModalMapBackToParent = (
  name: string,
  mode?: 'push' | 'replace'
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => Promise<void | NavigationFailure | undefined>

export type TModalRouteContext = {
  push: TModalMapPush
  pop: TModalMapPop
  store: Record<string, TModalMapItem>
  getModalItem: (name: string) => TModalMapItem
  _setupModal: (name: string, options: TModalMapItem['options']) => void
  _unsetModal: (name: string) => void
  queryRoutes: TModalQueryRoute[]
  openModal: (name: string, data?: Record<string, any>) => void
  closeModal: (name: string, returnValue?: unknown) => void
  modalExists: (name: string) => boolean
  isModalActive: (name: string) => boolean
  getModalItemUnsafe: (name: string) => TModalMapItem | undefined
  unlockModal: (name: string) => void
  setModalReturnValue: (name: string, value: unknown) => void
}

export type TModalRouteContextKey = InjectionKey<TModalRouteContext>

export type TCreateRejection = (
  mode?: 'replace' | 'push',
  route?: RouteLocationRaw,
) => Rejection

export type TModalData = Record<string, {
  getModalData?: (data: Record<string, any>) => Record<string, any>
}>

export type TModalPathRoute = RouteRecordRaw & { name: string }
export type TModalHashRoute = RouteRecordRaw & { name: string }
export type TModalQueryRoute = { name: string, component: Component, meta?: Record<string, any> }
