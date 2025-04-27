import { Component, RendererElement, RendererNode, VNode } from 'vue'
import { NavigationFailure, RouteRecordRaw } from 'vue-router'
import { TDefer } from './helpers'

export type TModalType = 'global' | 'query' | 'path'

export type TModalMapItem = {
  name: string
  data: Record<string, any> | null
  type: TModalType | string

  /**
   * Allow enter when init navigation
   */
  direct?: boolean

  _manualLocked: boolean
  returnValue: unknown
  _openPromise: TDefer<unknown> | null
  _openPosition: number
  isActive: (name: string) => boolean
  activate: (name: string, data: Record<string, any>) => TDefer<unknown>
  deactivate: () => void
  findBase: (options?: {
    params?: Record<string, any>
  }) => { path: string } & Record<string, any>

  _settled: boolean

  options: {
    validate?: (data: unknown) => boolean
    props?: TModalData | ((data: TModalData | null) => TModalData)

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

export type TOpenModalOptions = {
  data: Record<string, any>
  query: Record<string, any>
  global: string
  params: Record<string, any>
}
export type TModalRouteContext = {
  push: TModalMapPush
  pop: TModalMapPop
  store: Record<string, TModalMapItem>
  getModalItem: (name: string) => TModalMapItem
  _setupModal: (name: string, options?: TModalMapItem['options']) => void
  _unsetModal: (name: string) => void
  queryRoutes: TModalQueryRoute[]
  // FIXME: my type is not concise
  openModal: (name: string, options?: Partial<TOpenModalOptions>) => Promise<any>
  closeModal: (name: string) => void
  modalExists: (name: string) => boolean
  isModalActive: (name: string) => boolean
  getModalItemUnsafe: (name: string) => TModalMapItem | undefined
  unlockModal: (name: string) => void
  setModalReturnValue: (name: string, value: unknown) => void
  getRelatedModalsByRouteName: (name: string) => { type: TModalType, modal: string[] } | undefined
  setModalLock: (name: string, lock: boolean) => void
  layouts: Record<string, Component>
}

export type TModalData = Record<string, any>

export type TModalPathRoute = RouteRecordRaw & { name: string }
export type TModalGlobalRoute = RouteRecordRaw & { name: string }
export type TModalQueryRoute = { name: string, component: Component, meta?: Record<string, any> }

export type TComponent = VNode<RendererNode, RendererElement, {
  [key: string]: any
}> | Component
