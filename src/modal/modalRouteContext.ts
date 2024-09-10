import { markRaw, onScopeDispose, reactive } from 'vue'
import { TModalHashRoute, TModalMapItem, TModalQueryRoute, TModalRouteContext, TModalRouteContextKey } from './types'
import { Router, RouteRecordNormalized, RouteRecordRaw, createRouterMatcher } from 'vue-router'
import { ensureArray, ensureInjection } from './helpers'

// TODO: disallow open the route without meta.modal
// TODO: force all route to have name
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

// TODO: handle close by esc key ?
export const modalRouteContextKey: TModalRouteContextKey = Symbol('modalRouteContext')
export const createModalRouteContext = (options: {
  router: Router
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
  const currentRoute = _options.router.currentRoute

  const store = reactive<Record<string, TModalMapItem>>({})

  const hash = createHashRoutes()
  const query = createQueryRoutes()

  const resolveHashRoute = (pathWithHash: string) => {
    const matcher = createRouterMatcher(router.getRoutes(), router.options)
    return matcher.resolve({ path: pathWithHash }, currentRoute.value)
  }

  registerQueryRoutes(_options.query)
  registerHashRoutes(_options.hash)
  console.log(_options.router.getRoutes())
  _options.router.getRoutes().forEach((route) => {
    if (route.meta?.modal && route.name && route.components?.default) {
      registerPathModalRoute(route)
    }
  })

  router.beforeEach((to, from, next) => {
    // const isInitNavigation = from.matched.length === 0
    let shouldReplace = false
    // Ensure modal state correct when navigate by back/forward button
    /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

    // const fromModal = from.meta.modal ? getModalItemUnsafe(from.name as string) : null
    // const toModal = to?.meta?.modal ? getModalItemUnsafe(to.name as string) : null

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
          shouldReplace = true
        }
      }
    })

    // 1. When from hash route to another hash route that based on another path route
    // 2. When router initialization
    if (to.hash.startsWith('#modal/')) {
      router.addRoute(to.name as string, hash.routes)
      const r = resolveHashRoute(to.fullPath)

      // TODO: is it safe to pass matcherLocation to next?
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
    // TODO: query route will mount even if it's not open...
    Object.keys(from.query).forEach((queryKey) => {
      if (modalExists(queryKey) && !(queryKey in to.query)) {
        const modal = getModalItemUnsafe(queryKey)
        if (modal && modal._stateMounted) {
          modal._stateMounted = false

          shouldReplace = true
        }
      }
    })

    if (shouldReplace) {
      return next(to)
    }
    else {
      return next()
    }
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
  function openModal(name: string, data: any = null) {
    const modal = getModalItem(name)
    if (modal.type === 'path') {
      push(name, data)
      router.push({ name })
    }
    else if (modal.type === 'hash') {
      // TODO: from here: currentRoute may be hash route
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
    const previousRoute = currentRoute.value.matched.slice(-2)[0]
    if (modal.type === 'path') {
      router.replace(previousRoute)
    }
    else if (modal.type === 'hash') {
      let hashPreviousRoute = previousRoute
      if (hashPreviousRoute?.meta?.modalHashRoot) {
        hashPreviousRoute = currentRoute.value.matched.slice(-3)[0]
        router.removeRoute(hash.routes.name as string)
      }
      router.replace(hashPreviousRoute || '/')
    }
    else if (modal.type === 'query') {
      const query = { ...currentRoute.value.query }

      // TODO: fix this
      // eslint-disable-next-line
      delete query[name]
      console.log('replace query', query)
      router.replace({ query })
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
  // TODO: enhance error message
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
