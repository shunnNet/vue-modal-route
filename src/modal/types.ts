import { InjectionKey } from 'vue'
import { NavigationFailure, RouteLocationRaw, RouteRecordSingleViewWithChildren } from 'vue-router'
import { Rejection } from './rejection'

export type TModalMapItem = {
  data: Record<string, any> | null
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
  hashRoutes: RouteRecordSingleViewWithChildren
  setupModal: (name: string, options: TModalMapItem['options']) => {
    open: (data: Record<string, any>) => void
  }
  unsetModal: (name: string) => void
  openModal: (name: string, data: Record<string, any>) => void
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
