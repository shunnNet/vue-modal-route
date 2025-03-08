import { App, computed, onScopeDispose } from 'vue'
import { TModalData, TModalGlobalRoute, TModalMapItem, TModalQueryRoute, TModalRouteContext, TModalType, TOpenModalOptions } from './types'
import {
  Router,
  RouteRecordNormalized,
  RouteRecordRaw,
  RouteLocationNormalizedGeneric,
  useRoute,
  NavigationFailure,
  RouterHistory,
} from 'vue-router'
import { ensureArray, isPlainObject, noop, applyModalPrefixToRoutes } from './helpers'
import { createGlobalRoutes, isGlobalModalRootRoute } from './global'
import { useModalHistory } from './history'
import { createModalStore } from './store'
import { createQueryRoutes } from './query'
import { createPathRoutes } from './path'
import { createContext } from './context'
import { createContext as createVueContext } from '@vue-use-x/common'
import { useMatchedRoute, useRouterUtils } from './router'

type TModalNavigationGuardAfterEach = (context: {
  to: RouteLocationNormalizedGeneric
  from: RouteLocationNormalizedGeneric
  failure: NavigationFailure | undefined | ReturnType<() => void>
  ctx: Record<string, any>
}) => any | Promise<any>

// Note: find some way to mark modal open by openModal/closeModal

export const modalRouteContext = createVueContext<TModalRouteContext>()

export const createModalRoute = (
  options: Partial<{
    query: TModalQueryRoute[]
    global: TModalGlobalRoute[]
    direct: boolean
  }> & {
    router: Router
    history: RouterHistory
  },
) => {
  const { router, history: routerHistory } = options

  const _options = {
    direct: options.direct || false,
    query: ensureArray(options.query as TModalQueryRoute[]),
    global: applyModalPrefixToRoutes(ensureArray(options.global as TModalGlobalRoute[])),
  }

  const currentRoute = router.currentRoute

  const { paramsToPath } = useRouterUtils(router)

  const store = createModalStore()

  const {
    goHistory,
    getNavigationInfo,
    pushHistory,
    replaceHistory,
    tagHistory,
    getCurrentPosition,
    getPositionByTag,
    initPosition,
  } = useModalHistory({ router, routerHistory })

  const context = createContext()

  // NOTE: It's better to bind the context with something like navigation instance for every navigation
  // ! the global context will not correct when run "await route.push" in afterEach
  // or make a global id by "to" and "from" ?
  router.beforeEach((to, from) => {
    context.append(getNavigationInfo(to, from))
    let unregister: any = noop
    unregister = router.afterEach(() => {
      context.reset()
      unregister()
    })
  })

  const {
    registerGlobalRoutes,
    prepareGlobalRoute,
    openModal: openGlobalModal,
  } = createGlobalRoutes(store, router)

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

  const modalRouteCollection: Map<string, { type: TModalType, modal: string[] }> = new Map()
  const getRelatedModalsByRouteName = (name: string) => modalRouteCollection.get(name)

  registerQueryRoutes(_options.query)
  registerGlobalRoutes(_options.global)

  const registChildren = (type: string, parents: string[], children: TModalGlobalRoute[] | RouteRecordRaw[]) => {
    children.forEach((route) => {
      const _parents = [...parents, ...(route.meta?.modal && route.name && route.components?.['modal-default'] ? [route.name as string] : [])]
      if (route.name) {
        modalRouteCollection.set(route.name as string, { type: 'path', modal: [..._parents] })
      }
      if (Array.isArray(route.children)) {
        registChildren(type, _parents, route.children)
      }
    })
  }
  router.getRoutes().forEach((route) => {
    if (route.meta?.modal && route.name && route.components?.['modal-default']) {
      registerPathModalRoute(route)
      registChildren('path', [route.name as string], route.children || [])
      modalRouteCollection.set(route.name as string, { type: 'path', modal: [route.name as string] })
    }
  })
  _options.global.forEach((route) => {
    if (route.meta?.modal && route.name && route.components?.['modal-default']) {
      registChildren('global', [route.name as string], route.children || [])
      modalRouteCollection.set(route.name as string, { type: 'global', modal: [route.name as string] })
    }
  })
  _options.query.forEach((route) => {
    if (route.name) {
      modalRouteCollection.set(route.name as string, { type: 'query', modal: [route.name as string] })
    }
  })
  // Not allow forward open without using openModal
  router.beforeEach((to, from) => {
    const ctx = context.get()

    const toOpenModal = to.matched
      .some(r =>
        (r.meta.modal && !from.matched.find(r2 => r2.name === r.name))
        || !!getQueryModalsFromQuery(to.query).length,
      )
    if (
      ctx.direction === 'forward'
      && toOpenModal
      && !ctx.openByOpenModal
    ) {
      console.log('Not allow forward open without using openModal', to.name)
      return false
    }
  })
  // handle direct enter global modal
  // Note: seems like vue-router do something like route match when register plugin
  // It will report warning if put dynamic route registration when router.beforeEach
  // So we need to handle before that
  const isGlobalRoute = routerHistory.location.includes('_modal')
  if (isGlobalRoute) {
    const baseRoute = router.resolve(routerHistory.location.replace(/\/_modal.*/, ''))
    prepareGlobalRoute(baseRoute.name as string)
  }

  // Not allow directly enter if modal didn't has "meta.modal.direct: true" or global direct: true
  router.beforeEach(async (to) => {
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
      const basePosition = getPositionByTag(notAllowRoute.name as string)
      if (basePosition !== null) {
        console.log('go back to base position', basePosition)
        await goHistory(basePosition - getCurrentPosition(), false)
      }
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
  // Not allow open modal by router.push / router.replace
  router.beforeEach((to, from) => {
    const ctx = context.get()
    if (ctx.isInitNavigation || (!ctx.isInitNavigation && ctx.openByOpenModal)) {
      return true
    }
    if (to.matched.find(r => r.meta.modal && !from.matched.some(r2 => r2.name === r.name))) {
      console.warn('Not allow open modal by router.push / router.replace')
      return false
    }
  })
  const backToBase = async (name: string, go: boolean = false) => {
    const basePosition = getPositionByTag(name)
    if (basePosition !== null) {
      const backSteps = basePosition - getCurrentPosition()
      if (backSteps !== 0) {
        console.log(`go ${backSteps} steps back to base position`, basePosition)
        return go ? await router.go(backSteps) : await goHistory(backSteps, false)
      }
    }
  }

  // close modal and
  // go to other route (e.g: router.push / modal.open)
  // go to other route if is init modal (e.g: router.push / modal.open)
  // only close modal
  const handleHistoryForCloseModal = (async ({ to, from, failure, ctx }) => {
    if (
      failure
      || ctx.isInitNavigation
      || ctx.closeByCloseModal
      // no need pad step when only backward.
      || ctx.direction === 'backward'
      || ctx.direct
    ) {
      return
    }
    // ! Note: history already changed
    // TODO: check if modal allow direct open
    // 1. find the first closed modal to get which base route to back
    const fromQueryModalNames = getQueryModalsFromQuery(from.query).map(m => m.name)
    const toQueryModalNames = getQueryModalsFromQuery(to.query).map(m => m.name)
    const firstClosedQueryModalName = fromQueryModalNames.find(
      m => !toQueryModalNames.includes(m),
    )
    const firstClosedModalName = from.matched.find(
      r => r.meta.modal && !to.matched.some(r2 => r2.name === r.name),
    )?.name as string | undefined

    // path or global modal take precedence over query modal
    const closingModalName = (firstClosedModalName || firstClosedQueryModalName) as string

    if (!closingModalName) {
      return
    }
    const basePosition = getPositionByTag(closingModalName)
    const hasBasePosition = basePosition !== null

    console.log('closing modal', closingModalName, hasBasePosition)
    if (hasBasePosition) {
      if (closingModalName) {
        console.log('is not init navigation, go back to base route', closingModalName)
        await backToBase(closingModalName, ctx.closeByCloseModal ? true : false)
      }
      if (to.name !== from.name) {
        // Because router.push/openModal will close modal then go to other route, so we need recover the "to" history
        routerHistory.push(to.fullPath)
        console.log('recover history', to.fullPath)
      }
    }
    else {
      // For cases which close modal because go to other page
      padHistoryWhenInitModal(closingModalName)
    }
  }) satisfies TModalNavigationGuardAfterEach

  const padHistoryWhenOpenModal = (async ({ to, from, failure, ctx }) => {
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
    // Only handle opening "path, global" modal by OpenModal()

    console.log('Opening modal (path/global) by openModal...')

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
    const steps = to.matched.slice(index + 1).filter(r => !isGlobalModalRootRoute(r))

    if (steps.length === 1) {
      replaceHistory(to.fullPath)
      tagIfRouteModal(steps[0], getCurrentPosition() - 1)
      return
    }
    else {
      const [first, ...rest] = steps
      rest.pop() // remove the last route because it should be replaced by "to.fullPath" to keep query/global
      replaceHistory(paramsToPath(first, to.params))
      tagIfRouteModal(first, getCurrentPosition() - 1)

      rest.forEach((r) => {
        tagIfRouteModal(r, getCurrentPosition())
        pushHistory(paramsToPath(r, to.params))
      })
      tagIfRouteModal(to, getCurrentPosition())
      pushHistory(to.fullPath)

      return
    }
  }) satisfies TModalNavigationGuardAfterEach

  // afterEach guards will not keep the register order when meet "await", its execution order will decided by event loop
  // so we handle its order by hand
  router.afterEach(async (to, from, failure) => {
    const ctx = context.get()
    await handleHistoryForCloseModal({ to, from, failure, ctx })
    await padHistoryWhenOpenModal({ to, from, failure, ctx })
  })

  async function openModal(
    name: string,
    options?: {
      query?: Record<string, any>
      global?: string
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
      throw new Error(`Not allow open modal which is already opened: ${modalInfo.modal.join(',')}.`)
    }
    if (typeof options?.global === 'string' && options.global.startsWith('#modal')) {
      throw new Error('Not allow open modal with global start with "#modal"')
    }
    if (isPlainObject(options?.query) && Object.keys(options?.query).some(k => k.startsWith(mqprefix))) {
      throw new Error(`Not allow open modal with query key start with ${mqprefix}"`)
    }
    const modalNeedOpen = getModalItem(modalsNeedActivate.at(-1) as string)

    const _datas = Array.isArray(options?.data)
      ? options?.data
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
          global: options?.global,
          params: options?.params,
        }).catch(noop)
        break
      case 'global':
        openGlobalModal(name, {
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
    // ISSUE: page index open nested modalA/modalB -> close modalB to modalA -> open modalB -> modalB emit "return" with value
    // the openModal resolved promise will get the modalB's result (null)
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
      throw new Error(`Not allow close modal ${name} because it is not opened.`)
    }
    context.append({ closeByCloseModal: true })
    const basePosition = getPositionByTag(name)
    const hasBasePosition = basePosition !== null
    console.log('closing modal', name, hasBasePosition)

    // TODO: This may breaks when leave site, and go back from other site to modal route
    if (hasBasePosition) {
      // normal close and refresh enter
      await backToBase(name, true)
    }
    else {
      await padHistoryWhenInitModal(name)
    }
    modal.deactivate()
  }
  async function padHistoryWhenInitModal(closingModalName: string) {
    // NOTE: This modal may opened by directly enter and is not refresh
    // Query: no need handle. (because not allow directly enter)
    const closingModal = getModalItem(closingModalName)
    let rootBaseRoute = closingModal.findBase({ params: currentRoute.value.params })

    const baseRoute = rootBaseRoute
    while (rootBaseRoute && rootBaseRoute.meta?.modal) {
      rootBaseRoute = getModalItem(rootBaseRoute.name as string).findBase({ params: currentRoute.value.params })
    }

    // Note: route change when modal still open, the currentPosition will not be 0
    // We need its be 0 here to correctly pad history, for now...
    // TODO: Find a better way to detemine the direct entered modal
    if (getCurrentPosition() !== initPosition) {
      await goHistory(-getCurrentPosition(), false)
    }
    // pad history from root base route, but only back to closing modal base route
    if (rootBaseRoute) {
      const matched = currentRoute.value.matched.filter(r => !isGlobalModalRootRoute(r))
      const rootBaseIndex = matched.findIndex(r => r.name === rootBaseRoute.name)
      const baseIndex = matched.findIndex(r => r.name === baseRoute.name)
      if (rootBaseIndex !== -1) {
        replaceHistory(rootBaseRoute.path)
        matched.slice(rootBaseIndex + 1)
          .filter(r => !isGlobalModalRootRoute(r))
          .forEach((r) => {
            const name = r.name as string
            if (modalExists(name)) tagHistory(name)
            pushHistory(r.path)
          })

        console.log(`go ${1 - matched.slice(baseIndex).length} back to base route`, baseRoute.name)
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

  function isModalActive(name: string) {
    const modal = getModalItem(name)
    const locked = getModalLocked(name)
    if (modal.options?.manual && locked) {
      return false
    }
    return modal.isActive(name)
  }

  const _ctx = {
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
    install(app: App) {
      modalRouteContext.provideByApp(app, _ctx)
    },
  } as Router
}

export const useModalRoute = () => {
  const {
    closeModal,
    openModal,
    isModalActive,
  } = modalRouteContext.ensureInjection('useModalRoute must be used inside a ModalRoute component')

  return {
    setupModal,
    closeModal,
    openModal,
    isModalActive,
  }
}
export const setupModal = <ReturnValue = any>(
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
  } = modalRouteContext.ensureInjection('setupModal must be used inside a ModalRoute component')

  // useModal can not target nested modal
  const matchedRoute = useMatchedRoute()
  const currentRoute = useRoute()
  const relatedModalInfo = getRelatedModalsByRouteName(name)

  const inModalGlobalRoute = currentRoute.matched.some(r => isGlobalModalRootRoute(r))

  if (!relatedModalInfo) {
    throw new Error(`Can not find related modals for ${name}`)
  }

  if (matchedRoute?.value) {
    if (relatedModalInfo.type === 'global' && !inModalGlobalRoute) {
      throw new Error(`useModal for first layer global modal must be used outside <RouterView>`)
    }
    if (relatedModalInfo.type === 'query') {
      throw new Error(`useModal for query modal must be used outside <RouterView>`)
    }
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
  let modalNameToOpen = name
  if (
    relatedModalInfo.type === 'path'
    || (inModalGlobalRoute && relatedModalInfo.type === 'global')
  ) {
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
    modalNameToOpen = targetModals[0]
  }

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
    // TODO: data here should not accept array of data, because `open` only open single modal.
    open: (options?: Partial<TOpenModalOptions>) => openModal(name, options),
    close: () => closeModal(modalNameToOpen),
    unlock: () => unlockModal(modalNameToOpen),
    isActive: computed(() => isModalActive(modalNameToOpen)),
    returnValue,
  }
}

export const useModalReturnValue = <T>(name: string) => {
  const { store } = modalRouteContext.ensureInjection('useModalReturnValue must be used inside a ModalRoute component')

  return computed(() => store[name].returnValue as T)
}

export const useModalActive = (name: string) => {
  const { isModalActive } = modalRouteContext.ensureInjection('useModalActive must be used inside a ModalRoute component')

  return computed(() => isModalActive(name))
}

export const useModal = <ReturnValue>(name: string) => {
  const {
    closeModal,
    openModal,
    isModalActive,
  } = modalRouteContext.ensureInjection('useModal must be used inside a ModalRoute component')
  const returnValue = useModalReturnValue<ReturnValue>(name)

  return {
    open: (options?: Partial<TOpenModalOptions>) => openModal(name, options),
    close: () => closeModal(name),
    isActive: computed(() => isModalActive(name)),
    returnValue,
  }
}
