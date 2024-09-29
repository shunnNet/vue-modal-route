import { Router, RouteRecordNormalized } from 'vue-router'
import { createModalStore } from './store'

export const createPathRoutes = (
  store: ReturnType<typeof createModalStore>,
  router: Router,
) => {
  const currentRoute = router.currentRoute

  const defineActive = (name: string) =>
    currentRoute.value.matched.some(route => route.name === name)

  function openModal(name: string, data: Record<string, any> = {}) {
    store.push(name, data)
    router.push({ name })
  }
  function findBase(name: string) {
    const modalRoute = router.resolve({ name })
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
      open: openModal,
      findBase,
    })
    return aRoute
  }

  return {
    registerPathModalRoute,
  }
}
