import { InjectionKey } from 'vue'
import { NavigationFailure, RouteLocationRaw, RouteRecordSingleViewWithChildren } from 'vue-router'
import { Rejection } from './rejection'

export type TModalMapModal = {
  data: Record<string, any> | null
}
export type TModalMapPush = (name: string, data: Record<string, any>) => void
export type TModalMapPop = (name: string) => TModalMapModal['data']
export type TModalMapBackToParent = (
  name: string,
  mode?: 'push' | 'replace'
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => Promise<void | NavigationFailure | undefined>

export type TModalRouteContext = {
  push: TModalMapPush
  pop: TModalMapPop
  // backToParent: TModalMapBackToParent
  store: Record<string, TModalMapModal>
  getModalRoute: (name: string) => TModalMapModal
  // openGlobalModal: () => void
  // closeGlobalModal: () => void
  hashRoutes: RouteRecordSingleViewWithChildren
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
