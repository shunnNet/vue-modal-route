import { computed, inject, onScopeDispose } from 'vue'
import { TModalHashRoute, TModalMapItem, TModalQueryRoute, TModalRouteContext, TModalRouteContextKey } from './types'
import {
  Router,
  RouteRecordNormalized,
  RouterHistory,
  matchedRouteKey,
  useRouter,
  stringifyQuery,
} from 'vue-router'
import { ensureArray, ensureInjection, noop } from './helpers'
import { createHashRoutes } from './hash'
import { useModalHistory } from './history'
import { createModalStore } from './store'
import { createQueryRoutes } from './query'
import { createPathRoutes } from './path'

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
    goPromise,
    context,
    getNavigationInfo,
    setPosition,
  } = useModalHistory({ router, routerHistory })

  // TODO: find some time to makes me better
  // reset context when
  router.beforeEach((to, from) => {
    context.append(getNavigationInfo(to, from))
    context.append({
      lastVmr: { ...(routerHistory.state.vmr as Record<string, number> ?? {}) },
    })
    let unregister: any = noop
    unregister = router.afterEach(() => {
      context.reset()
      unregister()
    })
  })

  const { registerHashRoutes } = createHashRoutes(store, router)
  const { registerQueryRoutes, routes: queryRoutes, getQueryModalsFromQuery, mQName } = createQueryRoutes(store, router)
  const { registerPathModalRoute } = createPathRoutes(store, router)
  const {
    modalMap,
    get,
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

  registerQueryRoutes(_options.query)
  registerHashRoutes(_options.hash)
  _options.router.getRoutes().forEach((route) => {
    if (route.meta?.modal && route.name && route.components?.default) {
      registerPathModalRoute(route)
    }
  })
  const padSteps = async <T extends { path: string, name: string }>(
    paths: T[],
    options?: {
      go?: boolean
      triggerListener?: boolean
      makeState?: (
        path: T,
        currentState: RouterHistory['state'],
        index: number
      ) => Record<string, any>
    },
  ) => {
    const _options = {
      triggerListener: false,
      go: true,
      makeState: () => undefined,
      ...(options ?? {}),

    }
    paths.forEach((aPath, i) => {
      const _path = aPath.path
      const currentState = routerHistory.state
      console.log('currentState', { ...currentState })
      const _vmr = { ...(currentState.vmr as Record<string, any> ?? {}) }
      if (modalExists(aPath.name as string)) {
        _vmr[aPath.name as string] = currentState.position as number + (i === 0 ? -1 : 0)
      }
      const state = { vmr: _vmr }
      if (i === 0) {
        routerHistory.replace(_path, state)
        console.log('replace', _path, state)
      }
      else {
        routerHistory.push(_path, state)
        console.log('push', _path, state)
      }
    })
    if (_options.go) {
      await goPromise(1 - paths.length, _options.triggerListener)
    }
  }

  // Not allow forward open without using openModal
  router.beforeEach((to) => {
    const ctx = context.get()

    const toOpenModal = to.matched.some(
      r => r.meta.modal || !!getQueryModalsFromQuery(to.query).length,
    ) || to.hash.startsWith('#modal')

    if (
      ctx.direction === 'forward'
      && toOpenModal
      && !ctx.openByOpenModal
    ) {
      console.log('Not allow forward open without using openModal', to.name)
      return false
    }
  })

  // Remove vmr when modal not exists in next route
  router.afterEach((to, _, failure) => {
    if (failure) {
      return
    }
    const vmr = {
      ...(routerHistory.state.vmr ?? {}) as Record<string, number>,
    }
    const toQueryModals = getQueryModalsFromQuery(to.query).map(m => m.name)
    Object.keys(vmr).forEach((modalName) => {
      if (
        !to.matched.some(r => r.name === modalName)
        && !toQueryModals.includes(modalName)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete vmr[modalName]
      }
    })
    console.log('replace vmr', to.fullPath, vmr)
    routerHistory.replace(to.fullPath, { vmr })
  })
  router.afterEach(async (to, from, failure) => {
    if (failure) {
      return
    }
    const fromAModal = from.matched.some(r => r.meta.modal || r.meta.modalHashRoot)
    if (!fromAModal) {
      return
    }
    const firstNotExistModal = from.matched.find(r => r.meta.modal && !to.matched.some(r2 => r2.name === r.name))
    if (!firstNotExistModal) {
      return
    }
    const ctx = context.get()
    const basePosition = (ctx.lastVmr)[firstNotExistModal.name as string]
    if (basePosition !== undefined) {
      const backSteps = basePosition - (routerHistory.state.position as number)
      console.log(`go ${backSteps} steps back to base position`, basePosition)
      await goPromise(backSteps, false)
    }
    const base = basePosition !== undefined
      ? getModalItem(firstNotExistModal.name as string).findBase()
      : { name: '', path: '/' }

    const firstToModal = to.matched.find(r => r.meta.modal && !from.matched.some(r2 => r2.name === r.name))

    if (firstToModal) {
      const toModal = getModalItem(firstToModal.name as string)
      const toBase = toModal.findBase()
      const toBaseIndex = to.matched.findIndex(r => r.name === toBase.name)

      padSteps(
        [
          { name: base.name, path: base.path },
          ...to.matched.slice(toBaseIndex).filter(r => !r.meta.modalHashRoot) as { name: string, path: string }[],
        ],
        { go: false },
      )
      setPosition(routerHistory.state.position as number)
    }
  })

  // setup modal base position when open modal
  router.afterEach(async (to, from, failure) => {
    const ctx = context.get()
    if (!ctx.openByOpenModal || failure) {
      return
    }
    // Only handle OpenModal()

    // if previous route in current matched
    const index = to.matched.findIndex(r => r.name === from.name)
    if (index !== -1 && to.name !== from.name) {
      console.log('found from route in to matched')
      padSteps(
        to.matched
          .slice(index + 1)
          .filter(r => !r.meta.modalHashRoot) as { name: string, path: string }[],
        { go: false },
      )
      setPosition(routerHistory.state.position as number)
      return
    }
    // do nothing if from route not in to matched
    // basePosition will be set when closeModal instead

    // Query: only extract new modal
    const fromQueryModals = getQueryModalsFromQuery(from.query).map(m => m.name)
    const toQueryModals = getQueryModalsFromQuery(to.query).map(m => m.name)

    const newQueryModals = toQueryModals.filter(m => !fromQueryModals.includes(m))
    const newQuery = { ...to.query }
    console.log(from)
    newQueryModals.forEach((m) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete newQuery[m]
    })
    console.log(newQueryModals)
    if (newQueryModals.length) {
      padSteps(
        newQueryModals.map((m) => {
          newQuery[mQName(m)] = ''
          return {
            name: m,
            path: to.path + '?' + stringifyQuery(newQuery),
          }
        }),
        { go: false },
      )
    }
  })

  function isModalActive(name: string) {
    const modal = getModalItem(name)
    const locked = getModalLocked(name)
    if (modal.options?.manual && locked) {
      return false
    }
    return modal.isActive(name)
  }
  async function openModal(
    name: string,
    data?: any,
  ) {
    context.append({ openByOpenModal: true })
    // NOTE: .open() run router.push internally
    return getModalItem(name).open(name, data || null)
  }
  function closeModal(name: string, returnValue?: any) {
    context.append({ closeByCloseModal: true })
    const modal = getModalItem(name)
    const vmr = routerHistory.state.vmr as Record<string, number>
    const basePosition = vmr[name]

    console.log('close modal', name, 'basePosition', basePosition)
    if (basePosition !== undefined) {
      if (basePosition === routerHistory.state.position) {
        // Do nothing if base position is current position
        return
      }
      const backSteps = basePosition - (routerHistory.state.position as number)
      console.log(`close modal ${name}`, 'back', backSteps, 'steps to base position', basePosition)
      router.go(backSteps)
    }
    else {
      let rootBaseRoute = modal.findBase()
      const baseRoute = rootBaseRoute
      while (rootBaseRoute && rootBaseRoute.meta?.modal) {
        rootBaseRoute = getModalItem(rootBaseRoute.name as string).findBase()
      }
      if (rootBaseRoute) {
        // Make full steps from root base route
        // but back to closing modal base route
        const matched = currentRoute.value.matched.filter(r => !r.meta.modalHashRoot)
        const rootBaseIndex = matched.findIndex(r => r.name === rootBaseRoute.name)
        const baseIndex = matched.findIndex(r => r.name === baseRoute.name)
        if (rootBaseIndex !== -1) {
          padSteps(
            matched.slice(rootBaseIndex) as { name: string, path: string }[],
            { go: false },
          )
          setPosition(routerHistory.state.position as number)
          console.log('go back to base route', baseRoute.name)
          router.go(1 - matched.slice(baseIndex).length)
        }
        else {
          throw new Error('No modal base route not found')
        }
      }
      else {
        console.log('go back to \'/\', and pad steps to closing modal')
        routerHistory.replace('/')
        routerHistory.push(currentRoute.value.fullPath)
        routerHistory.go(-1)
      }
    }
    modal.close(name, returnValue)
  }

  const modalRouteContext = {
    store: modalMap,
    push,
    get,
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
