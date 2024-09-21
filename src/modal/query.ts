import { markRaw } from 'vue'
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

  const addRoutes = (newRoutes: TModalQueryRoute[]) => {
    newRoutes.forEach((aRoute) => {
      aRoute.component = markRaw(aRoute.component)
      _routes.push(aRoute)
    })
  }
  const defineActive = (name: string) => name in currentRoute.value.query
  function findBase(_: string) {
    // TODO: temporary solution
    return { ...currentRoute.value, query: {} }
  }

  function registerQueryRoutes(routeOrRouteList: TModalQueryRoute | TModalQueryRoute[]) {
    const routes = ensureArray(routeOrRouteList)
    routes.forEach((aRoute) => {
      if (!aRoute.name) {
        console.error('Modal route must have a name', aRoute)
        throw new Error('Modal route must have a name')
      }
      store.registerModal(aRoute.name, 'query', {
        ...aRoute.meta,
        isActive: defineActive,
        open: openModal,
        findBase,
      })
    })
    addRoutes(routes)
    return routes
  }

  function openModal(name: string, data: Record<string, any> = {}) {
    store.push(name, data)
    router.push({ query: { ...currentRoute.value.query, [name]: '' } })
  }

  function getQueryModalsFromQuery(query: Record<string, any>) {
    return Object.keys(query).flatMap((name) => {
      const modal = store.getModalItemUnsafe(name)
      return modal ? [modal] : []
    })
  }

  function getActiveQueryModals() {
    return getQueryModalsFromQuery(currentRoute.value.query)
      .filter(modal => modal.isActive(modal.name))
  }

  return {
    routes: _routes,
    addRoutes,
    registerQueryRoutes,
    openModal,
    getActiveQueryModals,
    getQueryModalsFromQuery,
  }
}
