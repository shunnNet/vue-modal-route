import { Component, RendererElement, RendererNode, VNode } from 'vue'
import { RouteRecordRaw } from 'vue-router'
import type { TCreateModalRelationReturn } from './core'
import { createModalRouteStore } from './core'

export type TModalType = 'global' | 'query' | 'path'
export type TModalData = Record<string, any>
export type TModalRouteRecordRaw = RouteRecordRaw & { name: string }
export type TModalQueryRouteRecord = { name: string, component: Component, meta?: Record<string, any> }

export type TComponent = VNode<RendererNode, RendererElement, {
  [key: string]: any
}> | Component

export type TOpenModalOptions<T extends 'single' | 'multiple' = 'single'> = {
  /**
   * Data to pass to modal route.
   *
   * Can optionally be an array of data to pass to multiple modal routes.
   */
  data: T extends 'single' ? TModalData : TModalData | [string, TModalData][]
  /**
   * Query parameters to pass to `router.push`.
   */
  query: Record<string, any>
  /**
   * Hash to pass to `router.push`.
   */
  hash: string
  /**
   * Params to pass to `router.push`.
   */
  params: Record<string, any>
}
export type TModalRouteContext = {
  store: ReturnType<typeof createModalRouteStore>
  queryRoutes: TModalQueryRouteRecord[]
  // FIXME: my type is not concise
  /**
   * Open modal routes by name.
   *
   * If the route is nested in other modal route, then multiple modal routes will be opened.
   *
   * @param name name of modal route
   * @param options options to open modal route
   * @returns promise of modal route
   */
  openModal: (name: string, options?: Partial<TOpenModalOptions<'multiple'>>) => Promise<any>
  /**
   * Close modal routes by name.
   *
   * @param name name of modal route
   * @returns promise of modal route
   */
  closeModal: (name: string) => Promise<void>
  relation: TCreateModalRelationReturn
  layouts: Record<string, Component>
  defineActive: (name: string) => boolean
  findBase: (name: string, params?: Record<string, any>) => RouteRecordRaw | null
}
