import { computed, inject, onScopeDispose } from 'vue'
import { TModalData, TModalHashRoute, TModalMapItem, TModalQueryRoute, TModalRouteContext, TModalRouteContextKey, TOpenModalOptions } from './types'
import {
  Router,
  RouteRecordNormalized,
  RouterHistory,
  matchedRouteKey,
  RouteRecordRaw,
  RouteLocationNormalizedGeneric,
  createRouterMatcher,
  RouteParamsGeneric,
  useRoute,
} from 'vue-router'
import { ensureArray, ensureInjection, isPlainObject, noop } from './helpers'
import { createHashRoutes } from './hash'
import { useModalHistory } from './history'
import { createModalStore } from './store'
import { createQueryRoutes } from './query'
import { createPathRoutes } from './path'
import { createContext } from './context'

// Note: find some way to mark modal open by openModal/closeModal
export const modalRouteContextKey: TModalRouteContextKey = Symbol('modalRouteContext')

export const createModalRoute = (options: {
  router: Router
  routerHistory: RouterHistory
  query?: TModalQueryRoute[]
  hash?: TModalHashRoute[]
  direct?: boolean
}) => {
  const _options = {
    direct: false,
    ...options,
    query: ensureArray(options.query as TModalQueryRoute[]),
    hash: ensureArray(options.hash as TModalHashRoute[]),
  }
  if (!_options.router) {
    throw new Error('router is required')
  }
  const router = _options.router
  const routerHistory = _options.routerHistory
  const currentRoute = _options.router.currentRoute
  const routerMatcher = createRouterMatcher(router.getRoutes(), router.options)
  const routeParamsToPath = (
    r: RouteRecordNormalized | RouteLocationNormalizedGeneric,
    params: RouteParamsGeneric,
  ) => {
    return routerMatcher.getRecordMatcher(r.name as string)?.stringify(params) || r.path
  }

  const store = createModalStore()
  const {
    goHistory,
    getNavigationInfo,
    pushHistory,
    replaceHistory,
    tagHistory,
    getCurrentPosition,
    getPositionByTag,
  } = useModalHistory({ router, routerHistory })

  const context = createContext()

  // NOTE: It's better to bind the context with something like navigation instance for every navigation
  // ! the global context will not correct when run "await route.push" in afterEach
  // or make a hash id by "to" and "from" ?
  router.beforeEach((to, from) => {
    context.append(getNavigationInfo(to, from))
    let unregister: any = noop
    unregister = router.afterEach(() => {
      context.reset()
      unregister()
    })
  })

  const {
    registerHashRoutes,
    resolveHashRoute,
    prepareHashRoute,
    openModal: openHashModal,
  } = createHashRoutes(store, router)

  const {
    registerQueryRoutes,
    routes: queryRoutes,
    getQueryModalsFromQuery,
    removeModalFromQuery,
    mqprefix,
    openModal: openQueryModal,
  } = createQueryRoutes(store, router)

  const { registerPathModalRoute, openModal: openPathModal } = createPathRoutes(store, router)

  const {
    modalMap,
    pop,
    push,
    getModalItem,
    getModalItemUnsafe,
    _setupModal,
    _unsetModal,
    unlockModal,
    setModalReturnValue,
    modalExists,
    getModalLocked,
    setModalLock,
  } = store

  const modalRouteCollection: Map<string, { type: 'path' | 'hash' | 'query', modal: string[] }> = new Map()
  const getRelatedModalsByRouteName = (name: string) => modalRouteCollection.get(name)

  registerQueryRoutes(_options.query)
  registerHashRoutes(_options.hash)

  const registChildren = (type: string, parents: string[], children: TModalHashRoute[] | RouteRecordRaw[]) => {
    children.forEach((route) => {
      const _parents = [...parents, ...(route.meta?.modal && route.name && route.component ? [route.name as string] : [])]
      if (route.name) {
        modalRouteCollection.set(route.name as string, { type: 'path', modal: [..._parents] })
      }
      if (Array.isArray(route.children)) {
        registChildren(type, _parents, route.children)
      }
    })
  }
  _options.router.getRoutes().forEach((route) => {
    if (route.meta?.modal && route.name && route.components?.default) {
      registerPathModalRoute(route)
      registChildren('path', [route.name as string], route.children || [])
      modalRouteCollection.set(route.name as string, { type: 'path', modal: [route.name as string] })
    }
  })
  _options.hash.forEach((route) => {
    if (route.meta?.modal && route.name && route.component) {
      registChildren('hash', [route.name as string], route.children || [])
      modalRouteCollection.set(route.name as string, { type: 'hash', modal: [route.name as string] })
    }
  })
  _options.query.forEach((route) => {
    if (route.name) {
      modalRouteCollection.set(route.name as string, { type: 'query', modal: [route.name as string] })
    }
  })

  // Not allow forward open without using openModal
  router.beforeEach((to) => {
    const ctx = context.get()

    const toOpenModal = to.matched
      .some(r => r.meta.modal || !!getQueryModalsFromQuery(to.query).length)
      || to.hash.startsWith('#modal')
    if (
      ctx.direction === 'forward'
      && toOpenModal
      && !ctx.openByOpenModal
    ) {
      console.log('Not allow forward open without using openModal', to.name)
      return false
    }
  })
  // handle direct enter hash modal
  router.beforeEach((to) => {
    const ctx = context.get()
    if (!ctx.isInitNavigation) {
      return true
    }
    prepareHashRoute(to.name as string)
    if (to.hash) {
      const result = resolveHashRoute(to.fullPath)
      return result || true
    }
    return true
  })
  // Not allow directly enter if modal didn't has "meta.modal.direct: true" or global direct: true
  router.beforeEach((to) => {
    const ctx = context.get()
    if (!ctx.isInitNavigation) {
      return true
    }
    const notAllowRoute = to.matched.find(r => r.meta.modal
      && (_options.direct
        ? r.meta.direct === false
        : !r.meta.direct),
    )
    // when direct: true, undefined means use _options.direct
    if (notAllowRoute) {
      const modal = getModalItem(notAllowRoute.name as string)
      const base = modal.findBase({ params: to.params })
      console.warn(`Not allow open modal ${notAllowRoute.name as string} with directly enter`)
      return base
    }

    return true
  })
  // not allow open query modal when directly enter and refresh
  router.beforeEach((to) => {
    const ctx = context.get()
    if (!ctx.isInitNavigation) {
      return true
    }
    let _query = { ...to.query }
    const queryModals = getQueryModalsFromQuery(to.query)
    if (queryModals.length) {
      queryModals.forEach((m) => {
        _query = removeModalFromQuery(_query, m.name)
        console.warn(`Not allow open query modal ${m.name} with directly enter`)
      })
      return { ...to, query: _query }
    }
  })
  const backToBase = async (name: string, go: boolean = false) => {
    const basePosition = getPositionByTag(name)
    if (basePosition !== null) {
      const backSteps = basePosition - getCurrentPosition()
      if (backSteps !== 0) {
        console.log(`go ${backSteps} steps back to base position`, basePosition)
        return go ? router.go(backSteps) : await goHistory(backSteps, false)
      }
    }
  }

  // close modal and
  // go to other route (e.g: router.push / modal.open)
  // go to other route if is init modal (e.g: router.push / modal.open)
  // only close modal
  router.afterEach(async (to, from, failure) => {
    const ctx = context.get()
    if (
      failure
      || ctx.isInitNavigation
      // no need pad step when only backward.
      // "unknown" direction for closeModal which use router.replace
      || ctx.direction === 'backward'
      || ctx.direct
    ) {
      return
    }
    // ! Note: history already changed

    // TODO: check if modal allow direct open
    let closingModalName: string
    if (ctx.closeByCloseModal && ctx.closingModal) {
      closingModalName = ctx.closingModal.name
      routerHistory.replace(ctx.closingPath) // recover original path because closeModal change query of the path
    }
    else {
      // 1. find the first closed modal to get which base route to back
      const fromQueryModalNames = getQueryModalsFromQuery(from.query).map(m => m.name)
      const toQueryModalNames = getQueryModalsFromQuery(to.query).map(m => m.name)
      const firstClosedQueryModalName = fromQueryModalNames.find(
        m => !toQueryModalNames.includes(m),
      )
      const firstClosedModalName = from.matched.find(
        r => r.meta.modal && !to.matched.some(r2 => r2.name === r.name),
      )?.name as string | undefined

      // path or hash modal take precedence over query modal
      closingModalName = (firstClosedModalName || firstClosedQueryModalName) as string
    }
    if (!closingModalName) {
      return
    }
    const basePosition = getPositionByTag(closingModalName)
    const hasBasePosition = basePosition === null

    console.log('closing modal', closingModalName, hasBasePosition)
    if (!hasBasePosition) {
      if (closingModalName) {
        console.log('is not init navigation, go back to base route', closingModalName)
        await backToBase(closingModalName, ctx.closeByCloseModal ? true : false)
      }
      if (to.name !== from.name) {
        // Because router.push/openModal is close modal then go to other route, so we need recover the "to" history
        routerHistory.push(to.fullPath)
        console.log('recover history', to.fullPath)
      }
    }
    else {
      // NOTE: This modal may opened by direct enter and is not refresh
      // Query: no need handle. (because not allow directly enter)

      // handle closeModal when no base tag in history
      const closingModal = getModalItem(closingModalName)
      let rootBaseRoute = closingModal.findBase({ params: from.params })

      const baseRoute = rootBaseRoute
      while (rootBaseRoute && rootBaseRoute.meta?.modal) {
        rootBaseRoute = getModalItem(rootBaseRoute.name as string).findBase()
      }
      // TODO: Find a better way to detemine the direct entered modal
      if (getCurrentPosition() !== 0) {
        await goHistory(-getCurrentPosition(), false)
      }
      // pad history from root base route, but only back to closing modal base route
      if (rootBaseRoute) {
        const matched = currentRoute.value.matched.filter(r => !r.meta.modalHashRoot)
        const rootBaseIndex = matched.findIndex(r => r.name === rootBaseRoute.name)
        const baseIndex = matched.findIndex(r => r.name === baseRoute.name)
        if (rootBaseIndex !== -1) {
          replaceHistory(rootBaseRoute.path)
          matched.slice(rootBaseIndex + 1)
            .filter(r => !r.meta.modalHashRoot)
            .forEach((r) => {
              const name = r.name as string
              if (modalExists(name)) tagHistory(name)
              pushHistory(r.path)
            })

          console.log('go back to base route', baseRoute.name, 1 - matched.slice(baseIndex).length)
          router.go(1 - matched.slice(baseIndex).length)
        }
        else {
          throw new Error('No modal base route not found')
        }
      }
      else {
        console.log('go back to "/", and pad history to closing modal')
        replaceHistory('/')
        pushHistory(currentRoute.value.fullPath)
        tagHistory(closingModalName)
        goHistory(-1)
      }
    }
  })

  // pad history when using openModal
  router.afterEach(async (to, from, failure) => {
    const ctx = context.get()
    if (failure || !ctx.openByOpenModal || ctx.direct) {
      return
    }
    console.log('afterEach: pad history when using openModal')
    // Query: only tag base position, because query modal only allow open one at a time
    if (ctx.openingModal.type === 'query') {
      tagHistory(ctx.openingModal.name, getCurrentPosition() - 1)
      return
    }
    // ! Note: the history already changed
    // Only handle opening "path, hash" modal by OpenModal()

    console.log('Opening modal (path/hash) by openModal...')

    // do nothing if same route
    const isSameRoute = to.name === from.name
    if (isSameRoute) {
      return
    }
    const tagIfRouteModal = (r: RouteRecordNormalized | RouteLocationNormalizedGeneric, position: number) => {
      if (modalExists(r.name as string)) {
        tagHistory(r.name as string, position)
      }
    }
    // Find shared parent route in "to" matched
    // if not found, use all "to" matched routes to pad history
    // e.g 1: A->B->C => A->D
    // e.g 2: X->Y => A->D
    const index = to.matched.findIndex(r => r.name === from.name)
    const steps = to.matched.slice(index + 1).filter(r => !r.meta.modalHashRoot)

    if (steps.length === 1) {
      replaceHistory(to.fullPath)
      tagIfRouteModal(steps[0], getCurrentPosition() - 1)
      return
    }
    else {
      const [first, ...rest] = steps
      rest.pop() // remove the last route because it should be replaced by "to.fullPath" to keep query/hash
      replaceHistory(routeParamsToPath(first, to.params))
      tagIfRouteModal(first, getCurrentPosition() - 1)

      rest.forEach((r) => {
        tagIfRouteModal(r, getCurrentPosition())
        pushHistory(routeParamsToPath(r, to.params))
      })
      tagIfRouteModal(to, getCurrentPosition())
      pushHistory(to.fullPath)

      return
    }
  })

  async function openModal(
    name: string,
    options?: {
      query?: Record<string, any>
      hash?: string
      params?: Record<string, any>
      data?: TModalData | [string, TModalData][]
    },
  ) {
    const modalInfo = getRelatedModalsByRouteName(name)
    if (!modalInfo) {
      throw new Error(`Modal ${name} is not found.`)
    }
    const modalsNeedActivate = modalInfo.modal.filter(m => !isModalActive(m))
    if (!modalsNeedActivate.length) {
      console.warn(`Not allow open modal ${modalInfo.modal.join(',')} which is already opened.`)
      return
    }
    if (typeof options?.hash === 'string' && options.hash.startsWith('#modal')) {
      throw new Error('Not allow open modal with hash start with "#modal"')
    }
    if (isPlainObject(options?.query) && Object.keys(options.query).some(k => k.startsWith(mqprefix))) {
      throw new Error(`Not allow open modal with query key start with ${mqprefix}"`)
    }
    const modalNeedOpen = getModalItem(modalsNeedActivate.at(-1) as string)

    const _datas = Array.isArray(options?.data)
      ? options.data
      : [[modalNeedOpen.name, options?.data]] as [string, TModalData][]

    const activateResults = modalsNeedActivate.map((m) => {
      const data = _datas.find(([name]) => name === m)?.[1]
      return getModalItem(m).activate(m, data)
    })

    // TODO: playback if failed
    context.append({ openByOpenModal: true, openingModal: modalNeedOpen })
    switch (modalInfo.type) {
      case 'path':
        openPathModal(name, {
          query: options?.query,
          hash: options?.hash,
          params: options?.params,
        }).catch(noop)
        break
      case 'hash':
        openHashModal(name, {
          query: options?.query,
          params: options?.params,
        }).catch(noop)
        break
      case 'query':
        openQueryModal(name, {
          query: options?.query,
        }).catch(noop)
        break
    }

    return Promise.all(activateResults)
      .then((results) => {
        if (results.length === 1) {
          return results[0]
        }
        return Object.fromEntries(results.map((r, i) => [modalsNeedActivate[i], r]))
      })
  }

  async function closeModal(name: string) {
    const modal = getModalItem(name)
    if (!modal.isActive(name)) {
      console.warn(`Not allow close modal ${name} because it is not opened.`, name)
      return
    }
    context.append({
      closeByCloseModal: true,
      closingModal: modal,
      closingPath: currentRoute.value.fullPath,
    })
    // TODO: Not good to close modal by query, it will force user to handle this route change
    await router.replace({
      ...currentRoute.value,
      query: {
        ...currentRoute.value.query,
        'vmr-close': name,
      },
    })
    modal.deactivate()
  }

  function isModalActive(name: string) {
    const modal = getModalItem(name)
    const locked = getModalLocked(name)
    if (modal.options?.manual && locked) {
      return false
    }
    return modal.isActive(name)
  }

  const modalRouteContext = {
    store: modalMap,
    push,
    pop,
    _setupModal,
    _unsetModal,
    openModal,
    closeModal,
    getModalItem,
    modalExists,
    isModalActive,
    unlockModal,
    setModalLock,
    getModalItemUnsafe,
    setModalReturnValue,
    getRelatedModalsByRouteName,
    queryRoutes,
  } satisfies TModalRouteContext

  return {
    install(app: any) {
      app.provide(modalRouteContextKey, modalRouteContext)
    },
  }
}

export const useModalRoute = () => {
  const {
    closeModal,
    openModal,
    isModalActive,
  } = ensureInjection(modalRouteContextKey, 'useModalRoute must be used inside a ModalRoute component')

  return {
    useModal,
    closeModal,
    openModal,
    isModalActive,
  }
}

export const useModal = <ReturnValue = any>(
  name: string,
  options?: TModalMapItem['options'],
) => {
  const {
    _setupModal,
    _unsetModal,
    closeModal,
    openModal,
    unlockModal,
    setModalLock,
    isModalActive,
    getRelatedModalsByRouteName,
    modalExists,
  } = ensureInjection(modalRouteContextKey, 'useModal must be used inside a ModalRoute component')

  // useModal can not target nested modal
  const matchedRoute = inject(matchedRouteKey, null)
  const currentRoute = useRoute()
  const relatedModalInfo = getRelatedModalsByRouteName(name)

  const inModalHashRoute = currentRoute.matched.some(r => r.meta.modalHashRoot)

  if (!relatedModalInfo) {
    throw new Error(`Can not find related modals for ${name}`)
  }
  if (
    !inModalHashRoute
    && ['hash', 'query'].includes(relatedModalInfo.type)
    && matchedRoute?.value
  ) {
    throw new Error(`useModal for hash or query modal must be used outside <RouterView>`)
  }
  const checkIfModalIsChild = (children: RouteRecordRaw[]) => {
    for (const child of children) {
      if (child.name === name) {
        return true
      }
      if (child.children && checkIfModalIsChild(child.children)) {
        return true
      }
    }
    return false
  }
  if (!checkIfModalIsChild(matchedRoute?.value?.children || [])) {
    throw new Error(`useModal ${name} must be used in a parent route of the modal.`)
  }

  const parentIndex = currentRoute.matched.findIndex(r =>
    matchedRoute?.value?.name === r.name && matchedRoute?.value?.path === r.path,
  )
  const openedModals = currentRoute.matched.slice(0, parentIndex + 1).flatMap(r => r.meta.modal ? [r.name as string] : [])
  const targetModals = relatedModalInfo.modal.filter(name => !openedModals.includes(name))

  if (targetModals.length > 1) {
    throw new Error(`Multiple modals found for ${name}, useModal can only be used for single modal.`)
  }

  const modalNameToOpen = targetModals[0]
  if (!modalExists(modalNameToOpen)) {
    throw new Error(`Can not found modal by ${name}. It is not a route name that inside modal route or modal its self.`)
  }

  try {
    _setupModal(modalNameToOpen, options)
  }
  catch (_) {
    throw new Error(`useModal ${name} may be called in multiple place in same times. useModal for a name can only be used in one place at a time.`)
  }
  onScopeDispose(() => {
    _unsetModal(modalNameToOpen)
  })
  if (options?.manual) {
    setModalLock(name, true)
  }
  const returnValue = useModalReturnValue<ReturnValue>(modalNameToOpen)

  return {
    open: (options?: Partial<TOpenModalOptions>) => openModal(name, options),
    close: () => closeModal(modalNameToOpen),
    unlock: () => unlockModal(modalNameToOpen),
    isActive: computed(() => isModalActive(modalNameToOpen)),
    returnValue,
  }
}

export const useModalReturnValue = <T>(name: string) => {
  const { store } = ensureInjection(modalRouteContextKey, 'useModalReturnValue must be used inside a ModalRoute component')

  return computed(() => store[name].returnValue as T)
}

export const useModalActive = (name: string) => {
  const { isModalActive } = ensureInjection(modalRouteContextKey, 'useModalActive must be used inside a ModalRoute component')

  return computed(() => isModalActive(name))
}
