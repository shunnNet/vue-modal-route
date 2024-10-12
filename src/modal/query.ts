import { defineAsyncComponent, markRaw } from 'vue'
import { TModalQueryRoute } from './types'
import { createModalStore } from './store'
import { ensureArray } from './helpers'
import { Router } from 'vue-router'

export const createQueryRoutes = (
  store: ReturnType<typeof createModalStore>,
  router: Router,
) => {
  const _routes: TModalQueryRoute[] = []
  const currentRoute = router.currentRoute
  const mqprefix = 'm-'
  const mQName = (name: string) => `${mqprefix}${name}`
  const mQuery = (name: string, value: any = '') => ({ [mQName(name)]: value })
  // const isMQuery = (name: string) => name.startsWith(mqprefix)
  const getNameFromMQuery = (name: string) => name.startsWith(mqprefix) ? name.slice(mqprefix.length) : ''

  function registerQueryRoutes(routeOrRouteList: TModalQueryRoute | TModalQueryRoute[]) {
    const routes = ensureArray(routeOrRouteList)
    routes.forEach((aRoute) => {
      if (!aRoute.name) {
        console.error('Modal route must have a name', aRoute)
        throw new Error('Modal route must have a name')
      }
      store.registerModal(aRoute.name, 'query', {
        ...aRoute.meta,
        isActive,
        open: openModal,
        findBase,
      })
    })
    addRoutes(routes)
    return routes
  }

  const addRoutes = (newRoutes: TModalQueryRoute[]) => {
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
  }) {
    return router.push({
      query: {
        ...currentRoute.value.query,
        ...options?.query,
        ...mQuery(name),
      },
    })
  }

  const isActive = (name: string) => mQName(name) in currentRoute.value.query

  function findBase(name: string) {
    const currentModalNames = getQueryModalsFromQuery(currentRoute.value.query).map(m => m.name)
    const index = currentModalNames.indexOf(name)
    if (index > -1) {
      const baseQueryNames = currentModalNames.slice(0, index)
      const newQuery = baseQueryNames.reduce((acc, name) => {
        return { ...acc, ...mQuery(name) }
      }, {})
      return { ...currentRoute.value, query: newQuery }
    }
    else {
      return null
    }
  }

  function getQueryModalsFromQuery(query: Record<string, any>) {
    return Object.keys(query).flatMap((name) => {
      const _name = getNameFromMQuery(name)
      const modal = store.getModalItemUnsafe(_name)
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
    registerQueryRoutes,
    openModal,
    getQueryModalsFromQuery,
    mQName,
    mQuery,
    removeModalFromQuery,
  }
}
