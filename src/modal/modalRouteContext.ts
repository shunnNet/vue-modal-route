import { markRaw, onScopeDispose, reactive } from 'vue'
import { TModalHashRoute, TModalMapItem, TModalQueryRoute, TModalRouteContext, TModalRouteContextKey } from './types'
import { Router, RouteRecordNormalized, RouteRecordRaw, createRouterMatcher, RouterHistory, RouteLocationGeneric, stringifyQuery } from 'vue-router'
import { ensureArray, ensureInjection, defer, TDefer } from './helpers'

const createHashRoutes = () => {
  const children: TModalHashRoute[] = []

  const addRoutes = (routes: TModalHashRoute[]) => {
    routes.forEach((route) => {
      children.push(route)
    })
  }

  return {
    routes: {
      name: 'modal-hash-root',
      path: '#modal',
      meta: {
        modalHashRoot: true,
      },
      children,
    },
    addRoutes,
  }
}
const createQueryRoutes = () => {
  const routes: TModalQueryRoute[] = []

  const addRoutes = (newRoutes: TModalQueryRoute[]) => {
    newRoutes.forEach((aRoute) => {
      aRoute.component = markRaw(aRoute.component)
      routes.push(aRoute)
    })
  }

  return {
    routes,
    addRoutes,
  }
}
let position = 0

export const modalRouteContextKey: TModalRouteContextKey = Symbol('modalRouteContext')
export const createModalRouteContext = (options: {
  router: Router
  routerHistory: RouterHistory
  query: TModalQueryRoute[]
  hash: TModalHashRoute[]
}) => {
  const _options = {
    ...options,
    query: ensureArray(options.query),
    hash: ensureArray(options.hash),
  }
  if (!_options.router) {
    throw new Error('router is required')
  }
  const router = _options.router
  const routerHistory = _options.routerHistory
  const currentRoute = _options.router.currentRoute

  const store = reactive<Record<string, TModalMapItem>>({})

  const hash = createHashRoutes()
  const query = createQueryRoutes()

  const resolveHashRoute = (pathWithHash: string) => {
    const matcher = createRouterMatcher(router.getRoutes(), router.options)
    return matcher.resolve({ path: pathWithHash }, currentRoute.value)
  }

  let _goPromise: null | TDefer<PopStateEvent['state']> = null
  window.addEventListener('popstate', (e) => {
    console.log('popstate', e.state)
    if (_goPromise) {
      _goPromise._resolve(e.state)
      _goPromise = null
    }
  })
  const goPromise = (delta: number, triggerListener: false) => {
    _goPromise = defer()
    routerHistory.go(delta, triggerListener)
    return _goPromise
  }

  registerQueryRoutes(_options.query)
  registerHashRoutes(_options.hash)
  _options.router.getRoutes().forEach((route) => {
    if (route.meta?.modal && route.name && route.components?.default) {
      registerPathModalRoute(route)
    }
  })
  const pendingModal: any = null
  const findModalBaseRoute = (route: any) => {
    const toModalBaseIndex = route.matched.findIndex((r: any) => r.meta.modal || r.meta.modalHashRoot) - 1
    const toModalBaseRoute = toModalBaseIndex < 0 ? null : route.matched[toModalBaseIndex]

    return {
      index: toModalBaseIndex,
      route: toModalBaseRoute,
    }
  }
  const getNavigationInfo = (to: RouteLocationGeneric, from: RouteLocationGeneric) => {
    const direction = history.state.position > position
      ? 'forward'
      : history.state.position < position
        ? 'backward'
        : 'unknown'
    const isInitNavigation = !from.matched.length

    position = history.state.position
    const currentModalRoute = to.matched.findLast(r => r.meta.modal)
    const queryModals = Object.keys(to.query).filter(queryKey => modalExists(queryKey))
    const { index: toModalBaseIndex, route: toModalBaseRoute } = findModalBaseRoute(to)
    console.log('direction', direction)
    console.log('isInitNavigation', isInitNavigation, from.name)

    return {
      direction,
      isInitNavigation,
      toModalBaseRoute,
      toModalBaseIndex,
      currentModalRoute,
      queryModals,
    }
  }
  router.afterEach(async (to, from) => {
    const { isInitNavigation, direction, currentModalRoute, queryModals } = getNavigationInfo(to, from)
    if (isInitNavigation && (currentModalRoute || queryModals.length)) {
      routerHistory.replace(to.fullPath, {
        initModal: true,
      })
      return
    }

    const modal = getModalItemUnsafe(to.name as string)
    if (!modal) {
      return
    }
    // const toModalBaseIndex = to.matched.findIndex(r => r.meta.modal || r.meta.modalHashRoot) - 1
    // const toModalBasePath = toModalBaseIndex < 0 ? null : to.matched[toModalBaseIndex].path

    if (to.meta.modal && to.name !== from.name) {
      {
        // backward to the previous modal
        const index = from.matched.findIndex(r => r.name === to.name)
        if (index !== -1 && direction === 'forward') {
          const step = (from.matched.length - 1) - index
          await goPromise(-1 - step, false)
          routerHistory.push(from.path)
          routerHistory.go(-1, false)

          return
        }
      }
      {
        // forward to the next modal
        const index = to.matched.findIndex(r => r.name === from.name)
        if (index !== -1) {
          to.matched.slice(index + 1).forEach((route, i) => {
            if (i === 0) {
              console.log('replace', route.path)
              routerHistory.replace(route.path)
            }
            else {
              console.log('push', route.path)
              routerHistory.push(route.path)
            }
          })
          return
        }
      }
    }

    // const base = from.matched.findIndex(r => r.meta.modal || r.meta.modalHashRoot) - 1
  })

  router.beforeEach((to, from, next) => {
    // Ensure modal state correct when navigate witout using openModal/closeModal
    // let shouldReplace = false

    to.matched.forEach((route) => {
      if (route.meta.modal) {
        const modal = getModalItemUnsafe(route.name as string)
        if (modal) {
          modal._stateMounted = true
        }
      }
    })
    // goto another route (whether it's a modal or not)
    // multiple modals can be closed at the same time
    // modals closed by some way except closeModal method
    from.matched.forEach((route) => {
      if (route.meta.modal && !to.matched.find(r => r.name === route.name)) {
        const modal = getModalItemUnsafe(route.name as string)
        if (modal && modal._stateMounted) {
          modal._stateMounted = false
          // shouldReplace = true
        }
      }
    })

    // 1. When from hash route to another hash route that based on another path route
    // 2. When router initialization
    if (to.hash.startsWith('#modal/')) {
      router.addRoute(to.name as string, hash.routes)
      const r = resolveHashRoute(to.fullPath)

      // Should include "shouldReplace" ?
      return r.name ? next(r) : next()
    }

    Object.keys(to.query).forEach((queryKey) => {
      if (modalExists(queryKey)) {
        const modal = getModalItemUnsafe(queryKey)
        if (modal) {
          modal._stateMounted = true
        }
      }
    })
    Object.keys(from.query).forEach((queryKey) => {
      if (modalExists(queryKey) && !(queryKey in to.query)) {
        const modal = getModalItemUnsafe(queryKey)
        if (modal && modal._stateMounted) {
          modal._stateMounted = false
        }
      }
    })

    return next()
  })
  function getModalItemUnsafe(name: string) {
    return store[name]
  }

  function ensureModalItem(name: string) {
    if (!store[name]) {
      throw new Error(`Modal route ${name} has not been defined`)
    }
    return store[name]
  }
  function push(name: string, data: Record<string, any>) {
    ensureModalItem(name).data = data
  }
  function pop(name: string) {
    const modal = ensureModalItem(name)
    const { data } = modal
    modal.data = null
    return data
  }
  function _setupModal(name: string, options: TModalMapItem['options']) {
    ensureModalItem(name).options = options
  }
  function _unsetModal(name: string) {
    const modal = ensureModalItem(name)
    modal.data = null
    modal.options = null
    modal._inuse = false
  }

  function getModalItem(name: string) {
    return ensureModalItem(name)
  }

  function registerModalRoute(
    name: string,
    type: TModalMapItem['type'],
  ) {
    if (store[name]) {
      throw new Error(`Modal route ${name} has already been defined`)
    }
    store[name] = {
      name,
      data: null,
      options: null,
      type,
      _inuse: false,
      _stateMounted: false,
    }
  }

  function registerHashRoutes(routes: RouteRecordRaw[]) {
    routes.map((aRoute) => {
      if (!(aRoute.meta?.modal && aRoute.name)) {
        return
      }
      registerModalRoute(aRoute.name as string, 'hash')
      if (aRoute.children?.length) {
        registerHashRoutes(aRoute.children)
      }
      return aRoute
    })
    hash.addRoutes(routes)
  }

  function registerQueryRoutes(routeOrRouteList: TModalQueryRoute | TModalQueryRoute[]) {
    const routes = ensureArray(routeOrRouteList)
    routes.forEach((aRoute) => {
      registerModalRoute(aRoute.name, 'query')
    })
    query.addRoutes(routes)
    return routes
  }
  function registerPathModalRoute(aRoute: RouteRecordNormalized) {
    registerModalRoute(aRoute.name as string, 'path')
    return aRoute
  }
  function setModalStateMounted(name: string, isMounted: boolean) {
    ensureModalItem(name)._stateMounted = isMounted
  }
  function modalExists(name: string) {
    return name in store
  }

  function setupModal(name: string, options: TModalMapItem['options']) {
    _setupModal(name, options)
    onScopeDispose(() => {
      _unsetModal(name)
    })
    return {
      open: (data: any) => openModal(name, data),
      close: () => closeModal(name),
    }
  }

  function isModalActive(name: string) {
    const modal = getModalItem(name)
    if (['path', 'hash'].includes(modal.type)) {
      return currentRoute.value.matched.some(route => route.name === name)
    }
    else if (modal.type === 'query') {
      return name in currentRoute.value.query
    }
    return false
  }
  async function openModal(name: string, data: any = null) {
    const modal = getModalItem(name)
    if (modal.type === 'path') {
      push(name, data)
      router.push({ name })
    }
    else if (modal.type === 'hash') {
      router.addRoute(currentRoute.value.name as string, hash.routes)
      push(name, data)
      router.push({ name })
    }
    else if (modal.type === 'query') {
      push(name, data)
      router.push({ query: { ...currentRoute.value.query, [name]: '' } })
    }
    setModalStateMounted(name, true)
  }
  function closeModal(name: string) {
    const modal = getModalItem(name)

    if (['path', 'hash'].includes(modal.type)) {
      if (modal.type === 'hash') {
        const previousRoute = currentRoute.value.matched.slice(-2)[0]

        let hashPreviousRoute = previousRoute
        if (hashPreviousRoute?.meta?.modalHashRoot) {
          hashPreviousRoute = currentRoute.value.matched.slice(-3)[0]
          router.removeRoute(hash.routes.name as string)
        }
      }
      const isInitModal = routerHistory.state.initModal
      if (isInitModal) {
        const { route: modalBaseRoute } = findModalBaseRoute(currentRoute.value)
        const target = modalBaseRoute ? modalBaseRoute.path : '/'
        routerHistory.replace(target, { initModal: false })
        router.replace(target)
      }
      else {
        router.back()
      }
    }
    else if (modal.type === 'query') {
      const query = { ...currentRoute.value.query }

      // TODO: fix this "Delete dynamic property"
      // eslint-disable-next-line
      delete query[name]
      const hasQueryModal = Object.keys(query).some(key => modalExists(key))
      // TODO: should preserve hash
      const currentRoutePath = currentRoute.value.fullPath.split('?')[0]
      if (routerHistory.state.initModal) {
        if (hasQueryModal) {
          routerHistory.replace(currentRoutePath + '?' + stringifyQuery(query))
          router.replace(currentRoutePath + '?' + stringifyQuery(query))
        }
        else {
          routerHistory.replace(currentRoutePath, { initModal: false })
          router.replace(currentRoutePath)
        }
      }
      else {
        router.back()
      }
    }

    setModalStateMounted(name, false)
  }

  const modalRouteContext = {
    store,
    push,
    pop,
    _setupModal,
    _unsetModal,
    setupModal,
    openModal,
    closeModal,
    getModalItem,
    hashRoutes: hash.routes,
    queryRoutes: query.routes,
    setModalStateMounted,
    modalExists,
    isModalActive,
    getModalItemUnsafe,
  } satisfies TModalRouteContext

  return {
    install(app: any) {
      app.provide(modalRouteContextKey, modalRouteContext)
    },
  }
}

export const useModalRoute = () => {
  const {
    setupModal,
    closeModal,
    openModal,
    isModalActive,
  } = ensureInjection(modalRouteContextKey, 'useModalRoute must be used inside a ModalRoute component')

  return {
    setupModal,
    closeModal,
    openModal,
    isModalActive,
  }
}
