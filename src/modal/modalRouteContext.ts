import { inject, reactive } from 'vue'
import { TModalMapModal, TModalRouteContextKey } from './types'
import { RouteRecordSingleViewWithChildren, useRoute, useRouter } from 'vue-router'

export const modalRouteContextKey: TModalRouteContextKey = Symbol('modalRouteContext')
export const createModalRouteContext = (
  routes: RouteRecordSingleViewWithChildren,
) => {
  const modalStore = reactive<Record<string, TModalMapModal>>({})
  const push = (name: string, data: Record<string, any>) => {
    modalStore[name] = { data }
  }
  const pop = (name: string) => {
    const { data } = modalStore[name]
    modalStore[name].data = null
    return data
  }

  const getModalRoute = (name: string) => modalStore[name]

  return {
    store: modalStore,
    push,
    pop,
    getModalRoute,
    hashRoutes: routes,
  }
}

export const useModalRouteContext = () => {
  const ctx = inject(modalRouteContextKey)
  if (!ctx) {
    // TODO: enhance error message
    throw new Error('useModalRouteContext must be used inside a ModalRoute component')
  }
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

  return {
    ...ctx,
    openGlobalModal,
    closeGlobalModal,
  }
}

export const useOpenModal = () => {
  const router = useRouter()
  const { push } = useModalRouteContext()

  // TODO: Should data be restored when previous page?
  const openModal = (name: string, data: any = null) => {
    console.log('openModal', name, data)

    push(name, data)
    router.push({ name })
  }
  return {
    openModal,
  }
}
