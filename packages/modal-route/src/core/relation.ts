import { RouteRecordRaw } from 'vue-router'
import type { TModalQueryRouteRecord, TModalRouteRecordRaw, TModalType } from '../types'
import { isModalRouteRecordRawNormalized } from '../utils'

export interface TModalRelation {
  type: TModalType
  modals: string[]
}

export type TModalRelationMap = Map<string, TModalRelation>

export type TModalRelationGet = (name: string) => TModalRelation

export type TModalRelationGetUnsafe = (name: string) => TModalRelation | undefined

export type TCreateModalRelationReturn = {
  set: TModalRelationSet
  get: TModalRelationGet
  getUnsafe: TModalRelationGetUnsafe
}

export type TModalRelationSet = (
  name: string,
  type: TModalRelation['type'],
  modals: TModalRelation['modals'],
) => void

export const createModalRelation = () => {
  const relationMap: TModalRelationMap = new Map()

  const getUnsafe: TModalRelationGetUnsafe = name => relationMap.get(name)

  const get: TModalRelationGet = (name) => {
    const relation = getUnsafe(name)
    if (!relation) {
      throw new Error(`Modal ${name} not found`)
    }
    return relation as TModalRelation
  }
  const set: TModalRelationSet = (name, type, modals) => {
    relationMap.set(name, { type, modals })
  }

  return {
    set,
    get,
    getUnsafe,
  }
}

/**
 * Relation contains all modal routes and its parents modal routes.
 *
 * A modal route children which is just in modal route but not modal, will not be registered in relation but related to its parents modal route.
 *
 */
export function registerModalRoutesRelation(
  relation: TCreateModalRelationReturn,
  routes: TModalRouteRecordRaw[] | RouteRecordRaw[],
  type: TModalType,
  ctx: {
    parents: string[]
    inModalRoute: boolean
  } = {
    parents: [],
    inModalRoute: false,
  },
) {
  routes.forEach((r) => {
    const isModalRoute = isModalRouteRecordRawNormalized(r)

    // Parents contain modal route itself and its all parents modal route.
    const _parents = [
      ...ctx.parents,
      ...(isModalRoute ? [r.name] : []),
    ]
    if (
      isModalRoute
      || (ctx.inModalRoute && typeof r.name === 'string')
    ) {
      // A modal route's children is related to its parents modal route.
      relation.set(r.name as string, type, [..._parents])
    }
    if (Array.isArray(r.children)) {
      registerModalRoutesRelation(
        relation,
        r.children,
        type,
        {
          parents: _parents,
          inModalRoute: ctx.inModalRoute || isModalRoute,
        },
      )
    }
  })
}

export function registerModalRoutesRelationQuery(
  relation: TCreateModalRelationReturn,
  routes: TModalQueryRouteRecord[],
) {
  routes.forEach(r => relation.set(r.name, 'query', [r.name]))
}
