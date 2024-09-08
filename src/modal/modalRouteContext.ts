import { inject, onScopeDispose, reactive } from 'vue'
import { TModalMapItem, TModalRouteContextKey } from './types'
import { Router, RouteRecordSingleViewWithChildren, useRoute, useRouter } from 'vue-router'
import { ensureInjection } from './helpers'

export const modalRouteContextKey: TModalRouteContextKey = Symbol('modalRouteContext')
export const createModalRouteContext = (
  router: Router,
  routes: RouteRecordSingleViewWithChildren,
) => {
  const store = reactive<Record<string, TModalMapItem | null>>({})
  const push = (name: string, data: Record<string, any>) => {
    if (store[name]) {
      store[name].data = data
    }
    else {
      store[name] = { data: null, options: null }
    }
  }
  const pop = (name: string) => {
    if (!store[name]) {
      return null
    }
    const { data } = store[name]
    store[name].data = null
    return data
  }
  const setupModal = (name: string, options: TModalMapItem['options']) => {
    if (store[name]) {
      store[name].options = options
    }
    else {
      store[name] = { data: null, options: options }
    }

    return {
      open: (data: any = null) => openModal(name, data),
    }
  }
  const unsetModal = (name: string) => {
    store[name] = null
  }

  const getModalItem = (name: string) => store[name]
  const openModal = (name: string, data: any = null) => {
    push(name, data)
    router.push({ name })
  }

  return {
    store,
    push,
    pop,
    hashRoutes: routes,
    setupModal,
    getModalItem,
    unsetModal,
    openModal,
  }
}

export const useModalRoute = () => {
  // TODO: enhance error message
  const ctx = ensureInjection(modalRouteContextKey, 'useModalRoute must be used inside a ModalRoute component')

  const router = useRouter()
  const currentRoute = useRoute()

  let _currentRouteName: string | null = null
  const openGlobalModal = (name: string, data: any = {}) => {
    _currentRouteName = currentRoute.name as string
    router.addRoute(currentRoute.name as any, ctx.hashRoutes)
    ctx.push(name, data)
    router.push({ name })
  }

  const closeGlobalModal = () => {
    router.replace({ name: _currentRouteName as string })
  }

  const setupModal = (name: string, options: TModalMapItem['options']) => {
    ctx.setupModal(name, options)
    onScopeDispose(() => {
      ctx.unsetModal(name)
    })
  }

  return {
    setupModal,
    openGlobalModal,
    closeGlobalModal,
    openModal: ctx.openModal,
  }
}
