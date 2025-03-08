import { createRouterMatcher, Router, RouteRecordRaw } from 'vue-router'
import { TModalGlobalRoute } from './types'
import { createModalStore } from './store'

const rootMetaName = 'globalModalRoot'

/**
 * If the route is a global modal root
 */
export const isGlobalModalRootRoute = (route: RouteRecordRaw) => route.meta?.[rootMetaName] === true

export const createGlobalRoutes = (
  store: ReturnType<typeof createModalStore>,
  router: Router,
) => {
  const children: TModalGlobalRoute[] = []
  const currentRoute = router.currentRoute
  let globalRootBaseName = ''

  const addRoutes = (routes: TModalGlobalRoute[]) => {
    routes.forEach((route) => {
      children.push(route)
    })
  }
  const defineActive = (name: string) => currentRoute.value.matched.some(route => route.name === name)

  function openModal(name: string, options?: {
    query?: Record<string, any>
    global?: string
    params?: Record<string, any>
  }) {
    prepareGlobalRoute()
    return router.push({
      name,
      ...(options?.params ? { params: options.params } : {}),
      ...(options?.query ? { query: options.query } : {}),
    })
  }
  function prepareGlobalRoute(target?: string) {
    const base = target || currentRoute.value.name
    if (globalRootBaseName !== base) {
      globalRootBaseName = base as string
      router.addRoute(globalRootBaseName as string, globalRoute)
    }
  }

  function findBase(name: string, params: Record<string, any> = {}) {
    const modalRoute = router.resolve({ name, params })
    const selfIndex = modalRoute.matched.findIndex(route => route.name === name)
    if (selfIndex > 0) {
      if (modalRoute.matched[selfIndex - 1].name === 'modal-root-global') {
        return modalRoute.matched[selfIndex - 2]
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

  function registerGlobalRoutes(routes: RouteRecordRaw[]) {
    routes.map((aRoute) => {
      if (!aRoute.meta?.modal) {
        return
      }
      if (!aRoute.name) {
        console.error('Modal route must have a name', aRoute)
        throw new Error('Modal route must have a name')
      }
      store.registerModal(aRoute.name as string, 'global', {
        ...aRoute.meta,
        isActive: defineActive,
        findBase,
      })
      if (aRoute.children?.length) {
        registerGlobalRoutes(aRoute.children)
      }
      return aRoute
    })
    // @ts-expect-error TODO: fix this
    addRoutes(routes)
  }

  const resolveGlobalRoute = (path: string) => {
    // todo: use routerUtils ?
    const matcher = createRouterMatcher(router.getRoutes(), router.options)
    return matcher.resolve({ path }, currentRoute.value)
  }
  const globalRoute = {
    name: 'modal-root-global',
    path: '_modal',
    meta: {
      [rootMetaName]: true,
    },
    children,
  }

  return {
    routes: globalRoute,
    addRoutes,
    registerGlobalRoutes,
    resolveGlobalRoute,
    prepareGlobalRoute,
    openModal,
  }
}
