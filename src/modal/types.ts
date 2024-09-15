import { Component, InjectionKey } from 'vue'
import { NavigationFailure, RouteLocationRaw, RouteRecordRaw, RouteRecordSingleViewWithChildren } from 'vue-router'
import { Rejection } from './rejection'

export type TModalMapItem = {
  name: string
  data: Record<string, any> | null
  type: 'hash' | 'query' | 'path' | string
  _inuse: boolean
  /**
   * Does state in history
   */
  _stateMounted: boolean
  /**
   * Allow enter when init navigation
   */
  direct?: boolean
  options: {
    props?: {
      handler: (
        data: Record<string, any> | null,
        reject: TCreateRejection
      ) => Record<string, any> | Rejection
      mode?: 'beforeVisible' | 'afterVisible'
    } | Record<string, any>
    slots?: Record<string, any>
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
  hashRoutes: RouteRecordSingleViewWithChildren
  queryRoutes: TModalQueryRoute[]
  setModalStateMounted: (name: string, isMounted: boolean) => void
  openModal: (name: string, data: Record<string, any>) => void
  closeModal: (name: string) => void
  setupModal: (name: string, options: TModalMapItem['options']) => void
  modalExists: (name: string) => boolean
  isModalActive: (name: string) => boolean
  getModalItemUnsafe: (name: string) => TModalMapItem | undefined
}

export type TModalRouteContextKey = InjectionKey<TModalRouteContext>

export type TCreateRejection = (
  mode?: 'replace' | 'push',
  route?: RouteLocationRaw,
) => Rejection

export type TModalData = Record<string, {
  getModalData?: (data: Record<string, any>, reject: TCreateRejection) => Record<string, any> | Rejection
  mode?: 'beforeVisible' | 'afterVisible'
}>

export type TModalPathRoute = RouteRecordRaw & { name: string }
export type TModalHashRoute = RouteRecordRaw & { name: string }
export type TModalQueryRoute = { name: string, component: Component, meta?: Record<string, any> }
