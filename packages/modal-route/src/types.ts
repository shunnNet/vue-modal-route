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

export type TOpenModalOptions = {
  data: TModalData
  query: Record<string, any>
  hash: string
  params: Record<string, any>
}
export type TModalRouteContext = {
  store: ReturnType<typeof createModalRouteStore>
  queryRoutes: TModalQueryRouteRecord[]
  // FIXME: my type is not concise
  openModal: (name: string, options?: Partial<TOpenModalOptions>) => Promise<any>
  closeModal: (name: string) => Promise<void>
  relation: TCreateModalRelationReturn
  layouts: Record<string, Component>
  defineActive: (name: string) => boolean
  findBase: (name: string, params?: Record<string, any>) => RouteRecordRaw | null
}
