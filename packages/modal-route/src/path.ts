import { Router, RouteRecordNormalized } from 'vue-router'
import { createModalStore } from './store'
import { isModalRouteRecordNormalized } from './helpers'

export const createPathRoutes = (
  store: ReturnType<typeof createModalStore>,
  router: Router,
) => {
  const currentRoute = router.currentRoute

  const defineActive = (name: string) =>
    currentRoute.value.matched.some(route => route.name === name)

  function openModal(name: string, options?: {
    query?: Record<string, any>
    hash?: string
    params?: Record<string, any>
  }) {
    return router.push({
      name,
      ...(options?.hash ? { hash: options.hash } : {}),
      ...(options?.params ? { params: options.params } : {}),
      ...(options?.query ? { query: options.query } : {}),
    })
  }
  function findBase(name: string, params: Record<string, any> = {}) {
    const modalRoute = router.resolve({ name, params })
    const selfIndex = modalRoute.matched.findIndex(route => route.name === name)
    if (selfIndex > 0) {
      return modalRoute.matched[selfIndex - 1]
    }
    else if (selfIndex === 0) {
      // TODO: try back to "/" when "/user" (decrease 1 segment)
      // This will occur when not nested routes
      return null
    }
    else {
      // TODO Should return path: "/" ?
      throw new Error('No modal base route not found')
    }
  }

  function register(routes: RouteRecordNormalized[]) {
    routes.forEach((aRoute) => {
      if (isModalRouteRecordNormalized(aRoute)) {
        store.register(
          aRoute.name,
          'path',
          { direct: aRoute.meta.direct },
        )
      }
    })
  }

  return {
    register,
    open: openModal,
    findBase,
    defineActive,
  }
}
