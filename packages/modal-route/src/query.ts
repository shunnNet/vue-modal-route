import { defineAsyncComponent, markRaw } from 'vue'
import { TModalQueryRouteRecord } from './types'
import { createModalStore } from './store'
import { ensureArray } from './helpers'
import { Router } from 'vue-router'

export const createQueryRoutes = (
  store: ReturnType<typeof createModalStore>,
  router: Router,
) => {
  const _routes: TModalQueryRouteRecord[] = []
  const currentRoute = router.currentRoute
  const mqprefix = 'm-'
  const mQName = (name: string) => `${mqprefix}${name}`
  const mQuery = (name: string, value: any = '') => ({ [mQName(name)]: value })
  // const isMQuery = (name: string) => name.startsWith(mqprefix)
  const getNameFromMQuery = (name: string) => name.startsWith(mqprefix) ? name.slice(mqprefix.length) : ''

  function registerQueryRoutes(routeOrRouteList: TModalQueryRouteRecord | TModalQueryRouteRecord[]) {
    const routes = ensureArray(routeOrRouteList)
    routes.forEach((aRoute) => {
      if (typeof aRoute.name !== 'string') {
        console.error('Modal route must have a name', aRoute)
        throw new Error('Modal route must have a name')
      }
      store.register(aRoute.name, 'query', aRoute.meta)
    })
    addRoutes(routes)
    return routes
  }

  const addRoutes = (newRoutes: TModalQueryRouteRecord[]) => {
    newRoutes.forEach((aRoute) => {
      aRoute.component = markRaw(
        typeof aRoute.component === 'function'
          ? defineAsyncComponent(aRoute.component as any)
          : aRoute.component,
      )
      _routes.push(aRoute)
    })
  }

  function openModal(name: string, options?: {
    query?: Record<string, any>
    hash?: string
    params?: Record<string, any>
  }) {
    return router.push({
      ...(options?.hash ? { hash: options.hash } : {}),
      ...(options?.params ? { params: options.params } : {}),
      query: {
        ...currentRoute.value.query,
        ...options?.query,
        ...mQuery(name),
      },
    })
  }

  const defineActive = (name: string) => mQName(name) in currentRoute.value.query

  function findBase(name: string, params: Record<string, any> = {}) {
    const currentModalNames = getQueryModalsFromQuery(currentRoute.value.query).map(m => m.name)
    const index = currentModalNames.indexOf(name)
    if (index > -1) {
      const baseQueryNames = currentModalNames.slice(0, index)
      const newQuery = baseQueryNames.reduce((acc, name) => {
        return { ...acc, ...mQuery(name) }
      }, {})
      return { ...currentRoute.value, query: newQuery, params }
    }
    else {
      return null
    }
  }

  function getQueryModalsFromQuery(query: Record<string, any>) {
    return Object.keys(query).flatMap((name) => {
      const _name = getNameFromMQuery(name)
      const modal = store.getUnsafe(_name)
      return modal ? [modal] : []
    })
  }
  function removeModalFromQuery(query: Record<string, any>, name: string) {
    const _query = { ...query }
    delete _query[mQName(name)]
    return _query
  }

  return {
    routes: _routes,
    addRoutes,
    register: registerQueryRoutes,
    open: openModal,
    getQueryModalsFromQuery,
    mQName,
    mQuery,
    removeModalFromQuery,
    mqprefix,
    findBase,
    defineActive,
  }
}
