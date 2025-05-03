import { Router, RouteRecordRaw } from 'vue-router'
import type { TModalRouteRecordRaw } from '../types'
import { createModalRouteStore } from './store'

const rootMetaName = 'globalModalRoot'

/**
 * If the route is a global modal root
 */
export const isGlobalModalRootRoute = (route: RouteRecordRaw) => route.meta?.[rootMetaName] === true

export const createGlobalRoutes = (
  store: ReturnType<typeof createModalRouteStore>,
  router: Router,
) => {
  const children: TModalRouteRecordRaw[] = []
  const currentRoute = router.currentRoute
  let globalRootBaseName = ''

  function openModal(name: string, options?: {
    query?: Record<string, any>
    hash?: string
    params?: Record<string, any>
  }) {
    prepareGlobalRoute()
    return router.push({
      name,
      ...(options?.hash ? { hash: options.hash } : {}),
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

  function registerGlobalRoutes(routes: RouteRecordRaw[]) {
    routes.map((aRoute) => {
      if (!aRoute.meta?.modal) {
        return
      }
      if (typeof aRoute.name !== 'string') {
        console.error('Modal route must have a name', aRoute)
        throw new Error('Modal route must have a name')
      }
      store.register(aRoute.name, 'global', aRoute.meta)
      if (aRoute.children?.length) {
        registerGlobalRoutes(aRoute.children)
      }
      return aRoute
    })

    routes.forEach((route) => {
      // @ts-expect-error TODO: fix this
      children.push(route)
    })
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
  function defineActive(name: string) {
    return currentRoute.value.matched.some(route => route.name === name)
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
    register: registerGlobalRoutes,
    prepare: prepareGlobalRoute,
    open: openModal,
    findBase,
    defineActive,
  }
}
