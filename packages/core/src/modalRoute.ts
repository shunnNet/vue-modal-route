import { App, Component, markRaw } from 'vue'
import { TModalData, TModalQueryRouteRecord, TModalRouteContext } from './types'
import {
  Router,
  RouteRecordRaw,
  RouteLocationNormalizedGeneric,
  NavigationFailure,
  createRouter,
  createWebHistory,
} from 'vue-router'
import type { RouterOptions } from 'vue-router'
import { ensureArray, isPlainObject, noop, traverseRouteRecords, formalizeRouteRecord, createContext, useRouterUtils, isModalRouteRecordRawNormalized } from './utils'
import { useModalHistory } from './history/index'
import { createContext as createVueContext } from '@vue-use-x/common'
import {
  createModalRelation,
  registerModalRoutesRelation,
  registerModalRoutesRelationQuery,
  createModalRouteStore,
  ModalRoute,
  createQueryRoutes,
  createGlobalRoutes,
  isGlobalModalRootRoute,
  createPathRoutes,
} from './core'

type TModalNavigationGuardAfterEach = (context: {
  to: RouteLocationNormalizedGeneric
  from: RouteLocationNormalizedGeneric
  failure: NavigationFailure | undefined | ReturnType<() => void>
  ctx: Record<string, any>
}) => any | Promise<any>

// Note: find some way to mark modal open by openModal/closeModal

export const modalRouteContext = createVueContext<TModalRouteContext>()

export const modalLayoutContext = createVueContext<Record<string, Component>>()

interface TModalRouteOptionsInner {
  routes: RouteRecordRaw[]
  global: RouteRecordRaw[]
  query: TModalQueryRouteRecord[]
  direct: boolean
  layout: Record<string, Component>
  routerOptions: Omit<RouterOptions, 'routes' | 'history'>
}
interface TCreateModalRouteOptions extends Partial<TModalRouteOptionsInner> {
  routes: RouteRecordRaw[]
}

export function formalizeOptions(options: TCreateModalRouteOptions): TModalRouteOptionsInner {
  if (!options.routes) {
    throw new Error('routes is required')
  }
  return {
    routes: options.routes,
    global: ensureArray(options.global),
    query: ensureArray(options.query),
    direct: options.direct || false,
    layout: options.layout ?? {},
    routerOptions: options.routerOptions ?? {},
  }
}

export const createModalRoute = (options: TCreateModalRouteOptions) => {
  const _options = formalizeOptions(options)

  const formalizedRoutes = traverseRouteRecords(
    _options.routes,
    (route, inModalRoute, parent) => {
      const r = formalizeRouteRecord(route, inModalRoute)
      if (!route.name) {
        // Note: The name is required for `findBase` and global route base
        console.warn(`Route "${route.path}" must have a name, otherwise modal route will not work correctly.`)
      }
      if (
        isModalRouteRecordRawNormalized(r)
        && (!parent.length
          || (parent.length && !parent.some(
            p => !!p.component || (p.components && Object.keys(p.components).length),
          )))
      ) {
        throw new Error('Modal route must have a parent route with component.')
      }
      return r
    },
  )

  const routerHistory = createWebHistory()
  const router = createRouter({
    routes: formalizedRoutes,
    history: routerHistory,
    ..._options.routerOptions,
  })

  const currentRoute = router.currentRoute
  const store = createModalRouteStore()
  const relation = createModalRelation()

  const globalRoutes = createGlobalRoutes(store, router)
  const queryRoutes = createQueryRoutes(store, router)
  const pathRoutes = createPathRoutes(store, router)

  function findBase(nameOrModalRoute: string | ModalRoute, params: Record<string, any> = {}) {
    const modal = typeof nameOrModalRoute === 'string' ? store.get(nameOrModalRoute) : nameOrModalRoute
    switch (modal.type) {
      case 'global':
        return globalRoutes.findBase(modal.name, params)
      case 'query':
        // TODO: fix type
        return queryRoutes.findBase(modal.name, params) as RouteRecordRaw | null
      case 'path':
        return pathRoutes.findBase(modal.name, params)
    }
  }

  function defineActive(nameOrModalRoute: string | ModalRoute) {
    const modal = typeof nameOrModalRoute === 'string' ? store.get(nameOrModalRoute) : nameOrModalRoute
    switch (modal.type) {
      case 'global':
        return globalRoutes.defineActive(modal.name)
      case 'query':
        return queryRoutes.defineActive(modal.name)
      case 'path':
        return pathRoutes.defineActive(modal.name)
    }
  }

  // TODO: Should group modal registration to store same as relation?

  const globalRoutesFormalized = traverseRouteRecords(
    _options.global,
    (route, inModalRoute) => formalizeRouteRecord(route, inModalRoute),
  )
  pathRoutes.register(router.getRoutes())
  registerModalRoutesRelation(relation, formalizedRoutes, 'path')
  globalRoutes.register(globalRoutesFormalized)
  registerModalRoutesRelation(relation, globalRoutesFormalized, 'global')
  queryRoutes.register(_options.query)
  registerModalRoutesRelationQuery(relation, _options.query)

  const {
    goHistory,
    getNavigationInfo,
    tagHistory,
    writeHistory,
    rewriteFrom,
    getCurrentPosition,
    getPositionByTag,
    initPosition,
  } = useModalHistory({ router, routerHistory })

  const { paramsToPath } = useRouterUtils(router)

  // NOTE: It's better to bind the context with something like navigation instance for every navigation
  // ! the global context will not correct when run "await route.push" in afterEach
  // or make a global id by "to" and "from" ?
  const context = createContext()

  router.beforeEach((to, from) => {
    context.append(getNavigationInfo(to, from))
    let unregister: any = noop
    unregister = router.afterEach(() => {
      context.reset()
      unregister()
    })
  })

  // Not allow forward open without using openModal
  router.beforeEach((to, from) => {
    const ctx = context.get()

    const toOpenModal = to.matched
      .some(r =>
        (r.meta.modal && !from.matched.find(r2 => r2.name === r.name))
        || !!queryRoutes.getQueryModalsFromQuery(to.query).length,
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
    globalRoutes.prepare(baseRoute.name as string)
  }

  // Not allow directly enter if modal didn't has "meta.modal.direct: true" or global direct: true
  router.beforeEach(async (to) => {
    const ctx = context.get()
    if (!ctx.isInitNavigation) {
      return true
    }
    const notAllowRoute = to.matched.find(r => r.meta.modal && typeof r.name === 'string'
      && (_options.direct
        ? r.meta.direct === false
        : !r.meta.direct),
    )
    // when direct: true, undefined means use _options.direct
    if (notAllowRoute) {
      await goHistory(notAllowRoute.name as string).catch(noop)
      try {
        const base = findBase(notAllowRoute.name as string, { params: to.params })
        console.warn(`Not allow open modal ${notAllowRoute.name as string} with directly enter`)
        // TODO: force every modal route has base route
        return base ?? '/'
      }
      catch (e) {
        console.error(e)
      }
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
    const queryModals = queryRoutes.getQueryModalsFromQuery(to.query)
    if (queryModals.length) {
      queryModals.forEach((m) => {
        _query = queryRoutes.removeModalFromQuery(_query, m.name)
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
    const fromQueryModalNames = queryRoutes.getQueryModalsFromQuery(from.query).map(m => m.name)
    const toQueryModalNames = queryRoutes.getQueryModalsFromQuery(to.query).map(m => m.name)
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
      console.log('is not init navigation, go back to base route', closingModalName)
      await rewriteFrom(
        closingModalName,
        to.name !== from.name ? [to.fullPath] : [],
        !!ctx.closeByCloseModal,
      )
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

    // Find shared parent route in "to" matched
    // if not found, use all "to" matched routes to pad history
    // e.g 1: A->B->C => A->D
    // e.g 2: X->Y => A->D
    const index = to.matched.findIndex(r => r.name === from.name)
    const steps = to.matched.slice(index + 1).filter(r => !isGlobalModalRootRoute(r))
    writeHistory(
      steps.map((r) => {
        return {
          path: paramsToPath(r, to.params),
          tag: () => store.exists(r.name as string) && r.name as string,
          tagOffset: -1,
        }
      }),
      true,
    )
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
      hash?: string
      params?: Record<string, any>
      data?: TModalData | [string, TModalData][]
    },
  ) {
    const modalInfo = relation.get(name)

    const modalsNeedActivate = modalInfo.modals.filter(m => !defineActive(m))
    if (!modalsNeedActivate.length) {
      throw new Error(`Not allow open modal which is already opened: ${modalInfo.modals.join(',')}.`)
    }
    if (isPlainObject(options?.query) && Object.keys(options?.query).some(k => k.startsWith(queryRoutes.mqprefix))) {
      throw new Error(`Not allow open modal with query key start with ${queryRoutes.mqprefix}"`)
    }
    const modalNeedOpen = store.get(modalsNeedActivate.at(-1) as string)

    const _datas = Array.isArray(options?.data)
      ? options?.data
      : [[modalNeedOpen.name, options?.data]] as [string, TModalData][]

    const activateResults = modalsNeedActivate.map((m) => {
      const data = _datas.find(([name]) => name === m)?.[1]
      return store.get(m).activate(data)
    })

    // TODO: playback if failed
    context.append({ openByOpenModal: true, openingModal: modalNeedOpen })
    switch (modalInfo.type) {
      case 'path':
        pathRoutes.open(name, {
          query: options?.query,
          hash: options?.hash,
          params: options?.params,
        }).catch(noop)
        break
      case 'global':
        globalRoutes.open(name, {
          query: options?.query,
          hash: options?.hash,
          params: options?.params,
        }).catch(noop)
        break
      case 'query':
        queryRoutes.open(name, {
          query: options?.query,
          hash: options?.hash,
          params: options?.params,
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
    const modal = store.get(name)
    if (!defineActive(modal)) {
      throw new Error(`Not allow close modal ${name} because it is not opened.`)
    }
    context.append({ closeByCloseModal: true })
    const basePosition = getPositionByTag(name)
    const hasBasePosition = basePosition !== null
    console.log('closing modal', name, hasBasePosition)

    // TODO: This may breaks when leave site, and go back from other site to modal route
    if (hasBasePosition) {
      // normal close and refresh enter
      await goHistory(name, true)
    }
    else {
      await padHistoryWhenInitModal(name)
    }
    modal.deactivate()
  }
  async function padHistoryWhenInitModal(closingModalName: string) {
    // NOTE: This modal may opened by directly enter and is not refresh
    // Query: no need handle. (because not allow directly enter)
    const closingModal = store.get(closingModalName)
    let rootBaseRoute = findBase(closingModal, { params: currentRoute.value.params })

    while (rootBaseRoute && rootBaseRoute.meta?.modal) {
      rootBaseRoute = findBase(rootBaseRoute.name as string, { params: currentRoute.value.params })
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
      if (rootBaseIndex !== -1) {
        writeHistory(
          [
            { path: rootBaseRoute.path, stay: true },
            ...matched.slice(rootBaseIndex + 1).filter(r => !isGlobalModalRootRoute(r))
              .map(r => ({
                path: r.path,
                tag: () => store.exists(r.name as string) ? r.name as string : null,
                tagOffset: -1,
              })),
          ], true,
        )
      }
      else {
        throw new Error('No modal base route not found')
      }
    }
    else {
      console.log('go back to "/", and pad history to closing modal')
      writeHistory([
        '/',
        { path: currentRoute.value.fullPath, tag: closingModalName, tagOffset: -1 },
      ], true)
    }
  }

  for (const name in _options.layout) {
    const comp = _options.layout[name]
    /**
       * (Note, maybe need more consideration)
       *
       * Support defineAsyncComponent and normal component.
       *
       * If user want to use async modal component with loading control,
       *
       * they can use `defineAsyncComponent` in modal layout component instead.
       *
       * We do not support dynamic import like vue-router does.
       *
       * Because we don't need to interact with navigation guard currently.
       *
       * https://github.com/vuejs/router/issues/1469
       * */
    _options.layout[name] = markRaw(comp)
  }

  const _ctx = {
    store,
    openModal,
    closeModal,
    relation,
    queryRoutes: queryRoutes.routes,
    layouts: _options.layout,
    defineActive,
    findBase,
  } satisfies TModalRouteContext

  return {
    ...router,
    install(app: App) {
      modalRouteContext.provideByApp(app, _ctx)
      app.use(router)
    },
  } as Router
}

// export const createNuxtModalRoute = (
//   options: Partial<{
//     query: TModalQueryRouteRecord[]
//     global: TModalRouteRecordRaw[]
//     direct: boolean
//   }> & {
//     router: Router
//     history: RouterHistory
//   },
// ) => {
//   const { router, history: routerHistory } = options

//   const _options = {
//     direct: options.direct || false,
//     query: ensureArray(options.query as TModalQueryRouteRecord[]),
//     global: formalizeRouteRecords(ensureArray(options.global as TModalRouteRecordRaw[])),
//   }

//   const store = createModalStore()

//   const {
//     registerGlobalRoutes,
//     prepareGlobalRoute,
//     openModal: openGlobalModal,
//   } = createGlobalRoutes(store, router)

//   const {
//     registerQueryRoutes,
//     routes: queryRoutes,
//     getQueryModalsFromQuery,
//     removeModalFromQuery,
//     mqprefix,
//     openModal: openQueryModal,
//   } = createQueryRoutes(store, router)

//   const { registerPathModalRoute, openModal: openPathModal } = createPathRoutes(store, router)

//   registerQueryRoutes(_options.query)
//   registerGlobalRoutes(_options.global)

//   const modalRouteCollection: Map<string, { type: TModalType, modal: string[] }> = new Map()
//   const getRelatedModalsByRouteName = (name: string) => modalRouteCollection.get(name)

//   const registChildren = (type: string, parents: string[], children: TModalRouteRecordRaw[] | RouteRecordRaw[]) => {
//     children.forEach((route) => {
//       const _parents = [...parents, ...(route.meta?.modal && route.name && route.components?.['modal-default'] ? [route.name as string] : [])]
//       if (route.name) {
//         modalRouteCollection.set(route.name as string, { type: 'path', modal: [..._parents] })
//       }
//       if (Array.isArray(route.children)) {
//         registChildren(type, _parents, route.children)
//       }
//     })
//   }
//   router.getRoutes().forEach((route) => {
//     if (route.meta?.modal && route.name && route.components?.['modal-default']) {
//       registerPathModalRoute(route)
//       registChildren('path', [route.name as string], route.children || [])
//       modalRouteCollection.set(route.name as string, { type: 'path', modal: [route.name as string] })
//     }
//   })
//   _options.global.forEach((route) => {
//     if (route.meta?.modal && route.name && route.components?.['modal-default']) {
//       registChildren('global', [route.name as string], route.children || [])
//       modalRouteCollection.set(route.name as string, { type: 'global', modal: [route.name as string] })
//     }
//   })
//   _options.query.forEach((route) => {
//     if (route.name) {
//       modalRouteCollection.set(route.name as string, { type: 'query', modal: [route.name as string] })
//     }
//   })

//   const {
//     modalMap,
//     pop,
//     push,
//     getModalItem,
//     getModalItemUnsafe,
//     _setupModal,
//     _unsetModal,
//     unlockModal,
//     setModalReturnValue,
//     modalExists,
//     getModalLocked,
//     setModalLock,
//   } = store

//   // const { paramsToPath } = useRouterUtils(router)

//   // NOTE: It's better to bind the context with something like navigation instance for every navigation
//   // ! the global context will not correct when run "await route.push" in afterEach
//   // or make a global id by "to" and "from" ?
//   const context = createContext()

//   router.beforeEach(() => {
//     context.append({
//       isInitNavigation: true,
//     })
//     let unregister: any = noop
//     unregister = router.afterEach(() => {
//       context.reset()
//       unregister()
//     })
//   })

//   // handle direct enter global modal
//   // Note: seems like vue-router do something like route match when register plugin
//   // It will report warning if put dynamic route registration when router.beforeEach
//   // So we need to handle before that
//   const isGlobalRoute = routerHistory.location.includes('_modal')
//   if (isGlobalRoute) {
//     const baseRoute = router.resolve(routerHistory.location.replace(/\/_modal.*/, ''))
//     prepareGlobalRoute(baseRoute.name as string)
//   }

//   // Not allow directly enter if modal didn't has "meta.modal.direct: true" or global direct: true
//   router.beforeEach(async (to) => {
//     const ctx = context.get()
//     if (!ctx.isInitNavigation) {
//       return true
//     }
//     const notAllowRoute = to.matched.find(r => r.meta.modal
//       && (_options.direct
//         ? r.meta.direct === false
//         : !r.meta.direct),
//     )
//     // when direct: true, undefined means use _options.direct
//     if (notAllowRoute) {
//       // TODO: what's purpose of this?
//       // await goHistory(notAllowRoute.name as string).catch(noop)
//       const modal = getModalItem(notAllowRoute.name as string)
//       const base = modal.findBase({ params: to.params })
//       console.warn(`Not allow open modal ${notAllowRoute.name as string} with directly enter`)
//       console.log(base, modal)
//       return base
//     }

//     return true
//   })
//   // not allow open query modal when directly enter and refresh
//   router.beforeEach((to) => {
//     const ctx = context.get()
//     if (!ctx.isInitNavigation) {
//       return true
//     }
//     let _query = { ...to.query }
//     const queryModals = getQueryModalsFromQuery(to.query)
//     if (queryModals.length) {
//       queryModals.forEach((m) => {
//         _query = removeModalFromQuery(_query, m.name)
//         console.warn(`Not allow open query modal ${m.name} with directly enter`)
//       })
//       return { ...to, query: _query }
//     }
//   })
//   // Not allow open modal by router.push / router.replace
//   router.beforeEach((to, from) => {
//     const ctx = context.get()
//     if (ctx.isInitNavigation || (!ctx.isInitNavigation && ctx.openByOpenModal)) {
//       return true
//     }
//     if (to.matched.find(r => r.meta.modal && !from.matched.some(r2 => r2.name === r.name))) {
//       console.warn('Not allow open modal by router.push / router.replace')
//       return false
//     }
//   })

//   async function openModal(
//     name: string,
//     options?: {
//       query?: Record<string, any>
//       global?: string
//       params?: Record<string, any>
//       data?: TModalData | [string, TModalData][]
//     },
//   ) {
//     const modalInfo = getRelatedModalsByRouteName(name)
//     if (!modalInfo) {
//       throw new Error(`Modal ${name} is not found.`)
//     }
//     const modalsNeedActivate = modalInfo.modal.filter(m => !isModalActive(m))
//     if (!modalsNeedActivate.length) {
//       throw new Error(`Not allow open modal which is already opened: ${modalInfo.modal.join(',')}.`)
//     }
//     if (typeof options?.global === 'string' && options.global.startsWith('#modal')) {
//       throw new Error('Not allow open modal with global start with "#modal"')
//     }
//     if (isPlainObject(options?.query) && Object.keys(options?.query).some(k => k.startsWith(mqprefix))) {
//       throw new Error(`Not allow open modal with query key start with ${mqprefix}"`)
//     }
//     const modalNeedOpen = getModalItem(modalsNeedActivate.at(-1) as string)

//     const _datas = Array.isArray(options?.data)
//       ? options?.data
//       : [[modalNeedOpen.name, options?.data]] as [string, TModalData][]

//     const activateResults = modalsNeedActivate.map((m) => {
//       const data = _datas.find(([name]) => name === m)?.[1]
//       return getModalItem(m).activate(m, data)
//     })

//     // TODO: playback if failed
//     context.append({ openByOpenModal: true, openingModal: modalNeedOpen })
//     switch (modalInfo.type) {
//       case 'path':
//         openPathModal(name, {
//           query: options?.query,
//           global: options?.global,
//           params: options?.params,
//         }).catch(noop)
//         break
//       case 'global':
//         openGlobalModal(name, {
//           query: options?.query,
//           params: options?.params,
//         }).catch(noop)
//         break
//       case 'query':
//         openQueryModal(name, {
//           query: options?.query,
//         }).catch(noop)
//         break
//     }
//     // ISSUE: page index open nested modalA/modalB -> close modalB to modalA -> open modalB -> modalB emit "return" with value
//     // the openModal resolved promise will get the modalB's result (null)
//     return Promise.all(activateResults)
//       .then((results) => {
//         if (results.length === 1) {
//           return results[0]
//         }
//         return Object.fromEntries(results.map((r, i) => [modalsNeedActivate[i], r]))
//       })
//   }

//   async function closeModal(name: string) {
//     const modal = getModalItem(name)
//     if (!modal.isActive(name)) {
//       throw new Error(`Not allow close modal ${name} because it is not opened.`)
//     }
//     context.append({ closeByCloseModal: true })
//     // const basePosition = getPositionByTag(name)
//     // const hasBasePosition = basePosition !== null
//     // console.log('closing modal', name, hasBasePosition)

//     // // TODO: This may breaks when leave site, and go back from other site to modal route
//     // if (hasBasePosition) {
//     //   // normal close and refresh enter
//     //   await goHistory(name, true)
//     // }
//     // else {
//     //   await padHistoryWhenInitModal(name)
//     // }
//     modal.deactivate()
//   }

//   function isModalActive(name: string) {
//     const modal = getModalItem(name)
//     const locked = getModalLocked(name)
//     if (modal.options?.manual && locked) {
//       return false
//     }
//     return modal.isActive(name)
//   }

//   const _ctx = {
//     store: modalMap,
//     push,
//     pop,
//     _setupModal,
//     _unsetModal,
//     openModal,
//     closeModal,
//     getModalItem,
//     modalExists,
//     isModalActive,
//     unlockModal,
//     setModalLock,
//     getModalItemUnsafe,
//     setModalReturnValue,
//     getRelatedModalsByRouteName,
//     queryRoutes,
//     layouts: {},
//   } satisfies TModalRouteContext

//   return {
//     install(app: App) {
//       modalRouteContext.provideByApp(app, _ctx)
//     },
//   } as Router
// }
