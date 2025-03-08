import { Router, RouteRecordNormalized } from 'vue-router'
import { createModalStore } from './store'

export const createPathRoutes = (
  store: ReturnType<typeof createModalStore>,
  router: Router,
) => {
  const currentRoute = router.currentRoute

  const defineActive = (name: string) =>
    currentRoute.value.matched.some(route => route.name === name)

  function openModal(name: string, options?: {
    query?: Record<string, any>
    global?: string
    params?: Record<string, any>
  }) {
    return router.push({
      name,
      // TODO
      // ...(options?.global ? { global: options.global } : {}),
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
      return null
    }
    else {
      // TODO Should return path: "/" ?
      throw new Error('No modal base route not found')
    }
  }

  function registerPathModalRoute(aRoute: RouteRecordNormalized) {
    store.registerModal(aRoute.name as string, 'path', {
      ...aRoute.meta,
      isActive: defineActive,
      findBase,
    })
    return aRoute
  }

  return {
    registerPathModalRoute,
    openModal,
  }
}
