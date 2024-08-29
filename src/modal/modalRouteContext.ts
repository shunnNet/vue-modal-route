import { inject, reactive } from 'vue'
import { TModalRouteContextKey } from './types'
import { Router, RouteRecord, RouteRecordNormalized } from 'vue-router'

export const modalRouteContextKey: TModalRouteContextKey = Symbol('modalRouteContext')

export const useModalRouteContext = () => {
  const ctx = inject(modalRouteContextKey)
  if (!ctx) {
    // TODO: enhance error message
    throw new Error('useModalRouteContext must be used inside a ModalRoute component')
  }

  return ctx
}

export type TModalMapModal = {
  data: Record<string, any> | null
  parent: RouteRecordNormalized
}

export const createModalRouteContext = (router: Router) => {
  const modalStore = reactive<Record<string, TModalMapModal>>({})
  const push = (name: string, data: Record<string, any>) => {
    modalStore[name].data = data
    console.log(modalStore[name])
  }
  const pop = (name: string) => {
    const { data } = modalStore[name]
    modalStore[name].data = null
    return data
  }
  const backToParent = (name: string, mode: 'push' | 'replace' = 'replace') => {
    const parent = modalStore[name].parent
    return router[mode](parent)
  }
  const getModalRoute = (name: string) => modalStore[name]
  const routeList = router.getRoutes()

  const calculateModalParent = (routeList: RouteRecord[]) => {
    const collector: Record<string, RouteRecord | null> = {}
    const calculate = (
      parent: RouteRecord | null,
      routeList: RouteRecord[],
    ) => {
      routeList.forEach((route) => {
        if (route.meta.modal) {
          // TODO: force modal route name to be string not symbol
          collector[route.name as string] = parent
        }
        if (route.children?.length) {
          // TODO: FIXME: remove assertion for route.children
          calculate(route, route.children as RouteRecord[])
        }
      })
    }
    calculate(null, routeList)
    Object.entries(collector).forEach(([key, value]) => {
      if (value === null) {
        console.warn('Modal route', key, 'has no parent. Modal can not be used without parent route.')
        // TODO: remove eslint disable
        // eslint-disable-next-line
        delete collector[key]
      }
      else {
        modalStore[key] = {
          data: null,
          parent: value,
        }
      }
    })
    return modalStore
  }
  calculateModalParent(routeList)

  return {
    store: modalStore,
    push,
    pop,
    backToParent,
    getModalRoute,
  }
}
