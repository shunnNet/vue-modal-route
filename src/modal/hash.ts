import { createRouterMatcher, Router, RouteRecordRaw } from 'vue-router'
import { TModalHashRoute } from './types'
import { createModalStore } from './store'

export const createHashRoutes = (
  store: ReturnType<typeof createModalStore>,
  router: Router,
) => {
  const children: TModalHashRoute[] = []
  const currentRoute = router.currentRoute

  const addRoutes = (routes: TModalHashRoute[]) => {
    routes.forEach((route) => {
      children.push(route)
    })
  }
  const defineActive = (name: string) =>
    currentRoute.value.matched.some(route => route.name === name)

  function openModal(name: string, data: Record<string, any> = {}) {
    router.addRoute(currentRoute.value.name as string, hashRoute)
    store.push(name, data)
    router.push({ name })
  }

  function findBase(name: string) {
    const modalRoute = router.resolve({ name })
    const selfIndex = modalRoute.matched.findIndex(route => route.name === name)
    if (selfIndex > 0) {
      if (modalRoute.matched[selfIndex - 1].name === 'modal-hash-root') {
        return {
          path: '/',
        }
      }
      else {
        return modalRoute.matched[selfIndex - 1]
      }
    }
    else {
      throw new Error('No modal base route not found')
      // TODO Should return path: "/" ?
    }
  }

  function registerHashRoutes(routes: RouteRecordRaw[]) {
    routes.map((aRoute) => {
      if (!aRoute.meta?.modal) {
        return
      }
      if (!aRoute.name) {
        console.error('Modal route must have a name', aRoute)
        throw new Error('Modal route must have a name')
      }
      store.registerModal(aRoute.name as string, 'hash', {
        ...aRoute.meta,
        isActive: defineActive,
        open: openModal,
        findBase,
      })
      if (aRoute.children?.length) {
        registerHashRoutes(aRoute.children)
      }
      return aRoute
    })
    // @ts-expect-error TODO: fix this
    addRoutes(routes)
  }

  const resolveHashRoute = (pathWithHash: string) => {
    const matcher = createRouterMatcher(router.getRoutes(), router.options)
    return matcher.resolve({ path: pathWithHash }, currentRoute.value)
  }
  const hashRoute = {
    name: 'modal-hash-root',
    path: '#modal',
    meta: {
      modalHashRoot: true,
    },
    children,
  }

  // router.beforeEach((to, _, next) => {
  //   // 1. When from hash route to another hash route that based on another path route
  //   // 2. When router initialization
  //   if (to.hash.startsWith('#modal/')) {
  //     router.addRoute(to.name as string, hashRoute)
  //     const r = resolveHashRoute(to.fullPath)

  //     // Should include "shouldReplace" ?
  //     return r.name ? next(r) : next()
  //   }
  //   else {
  //     return next(to)
  //   }
  // })
  router.afterEach((to, from) => {
    if (
      from.matched.some(route => route.meta.modalHashRoot)
      && to.matched.every(route => !route.meta.modalHashRoot)
    ) {
      router.removeRoute(hashRoute.name as string)
    }
  })

  return {
    routes: hashRoute,
    addRoutes,
    registerHashRoutes,
    resolveHashRoute,
  }
}
