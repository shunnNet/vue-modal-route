import { computed, inject, onScopeDispose } from 'vue'
import { TModalData, TModalHashRoute, TModalMapItem, TModalQueryRoute, TModalRouteContext, TModalRouteContextKey } from './types'
import {
  Router,
  RouteRecordNormalized,
  RouterHistory,
  matchedRouteKey,
  useRouter,
  RouteLocationRaw,
  RouteRecordRaw,
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
  query: TModalQueryRoute[]
  hash: TModalHashRoute[]
  direct?: boolean
}) => {
  const _options = {
    direct: false,
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
  } = createHashRoutes(store, router)

  const {
    registerQueryRoutes,
    routes: queryRoutes,
    getQueryModalsFromQuery,
    removeModalFromQuery,
  } = createQueryRoutes(store, router)

  const { registerPathModalRoute } = createPathRoutes(store, router)

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
  } = store

  const modalRouteCollection: Map<string, { type: 'path' | 'hash' | 'query', modal: string[] }> = new Map()
  const getRouteModalInfo = (name: string) => modalRouteCollection.get(name)

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
  console.log('modalRouteCollection', modalRouteCollection)

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
      const base = modal.findBase()
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
    console.log('afterEach: handle closeModal ')
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
      let rootBaseRoute = closingModal.findBase()

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
    // Find shared parent route in "to" matched
    // if not found, use all "to" matched routes to pad history
    // e.g 1: A->B->C => A->D
    // e.g 2: X->Y => A->D
    const index = to.matched.findIndex(r => r.name === from.name)
    const [first, ...rest] = to.matched.slice(index + 1).filter(r => !r.meta.modalHashRoot)
    replaceHistory(first.path)
    if (modalExists(first.name as string)) tagHistory(first.name as string, getCurrentPosition() - 1)
    rest.forEach((r) => {
      const name = r.name as string
      if (modalExists(name)) tagHistory(name)
      pushHistory(r.path)
    })
    return
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
    const modalInfo = getRouteModalInfo(name)
    if (!modalInfo) {
      console.warn(`Not allow open modal ${name} because it is not found.`, name)
      return
    }
    const modalsNeedActivate = modalInfo.modal.filter(m => !isModalActive(m))
    if (!modalsNeedActivate.length) {
      console.warn(`Not allow open modal ${modalInfo.modal.join(',')} because it is already opened.`)
      return
    }
    const modalNeedOpen = modalsNeedActivate.at(-1) as string
    if (Array.isArray(options?.data)) {
      modalsNeedActivate.forEach((m) => {
        const data = (options.data as [string, TModalData][]).find(([name]) => name === m)?.[1]
        getModalItem(m).activate(m, data || {})
      })
    }
    else if (isPlainObject(options?.data)) {
      getModalItem(modalNeedOpen).activate(modalNeedOpen, options.data)
    }

    const modalItem = getModalItem(modalNeedOpen)
    context.append({ openByOpenModal: true, openingModal: modalItem })
    modalItem.open(name, {
      query: options?.query,
      hash: options?.hash,
      params: options?.params,
    }).catch(noop)

    return modalItem._openPromise
  }

  async function closeModal(name: string, returnValue?: any) {
    const modal = getModalItem(name)
    if (!isModalActive(name)) {
      console.warn(`Not allow close modal ${name} because it is not opened.`, name)
      return
    }
    context.append({
      closeByCloseModal: true,
      closingModal: modal,
      closingPath: currentRoute.value.fullPath,
    })
    // TODO: playback if failed

    await router.replace({
      ...currentRoute.value,
      query: {
        ...currentRoute.value.query,
        'vmr-close': name,
      },
    })
    modal.close(name, returnValue)
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
    getModalItemUnsafe,
    setModalReturnValue,
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
    _setupModal,
    _unsetModal,
    closeModal,
    openModal,
    isModalActive,
    unlockModal,
  } = ensureInjection(modalRouteContextKey, 'useModalRoute must be used inside a ModalRoute component')

  function setupModal<ReturnValue = any>(name: string, options: TModalMapItem['options']) {
    _setupModal(name, options)
    onScopeDispose(() => {
      _unsetModal(name)
    })
    const returnValue = useModalReturnValue<ReturnValue>(name)

    return {
      open: (data: any) => openModal(name, data),
      close: (returnValue: any) => closeModal(name, returnValue),
      unlock: () => unlockModal(name),
      returnValue,
    }
  }

  return {
    setupModal,
    closeModal,
    openModal,
    isModalActive,
  }
}

export const useModalReturnValue = <T>(name: string) => {
  const { store } = ensureInjection(modalRouteContextKey, 'useModalReturnValue must be used inside a ModalRoute component')

  return computed(() => store[name].returnValue as T)
}

export const useModalRejection = () => {
  const matchedRoute = inject(matchedRouteKey)
  const router = useRouter()
  return () => {
    router.replace(matchedRoute!.value as RouteRecordNormalized)
  }
}
