import { HistoryState, RouteLocationNormalizedGeneric, Router, RouterHistory, START_LOCATION } from 'vue-router'
import { defer, TDefer } from './helpers'
import { createContext } from './context'

export type TModalHistory = ReturnType<typeof useModalHistory>

export const useModalHistory = (options: {
  router: Router
  routerHistory: RouterHistory
}) => {
  const _options = {
    ...options,
  }
  const router = _options.router
  const routerHistory = _options.routerHistory
  const initPosition = { value: history.state.position ?? 0 }

  const position = { value: 0 }
  router.afterEach((_to, _from, failure) => {
    if (!failure) {
      position.value = history.state.position as number
    }
  })
  const pushHistory: RouterHistory['push'] = (to: string, data?: HistoryState) => {
    const r = routerHistory.push(to, data)
    position.value = routerHistory.state.position as number
    console.log('push', to, data)

    return r
  }
  const replaceHistory: RouterHistory['replace'] = (to: string, data?: HistoryState) => {
    const r = routerHistory.replace(to, data)
    position.value = routerHistory.state.position as number
    console.log('replace', to, data)
    return r
  }

  let _goPromise: null | TDefer<PopStateEvent['state']> = null
  window.addEventListener('popstate', (e) => {
    // console.log('popstate', e.state)
    if (_goPromise) {
      _goPromise._resolve(e.state)
      _goPromise = null
    }
  })
  const goHistory = (delta: number, triggerListener: boolean = false) => {
    _goPromise = defer()
    routerHistory.go(delta, triggerListener)
    _goPromise.then(() => {
      position.value = routerHistory.state.position as number
    })
    return _goPromise
  }
  const getNavigationInfo = (
    _: RouteLocationNormalizedGeneric,
    from: RouteLocationNormalizedGeneric,
  ) => {
    const isInitNavigation = from === START_LOCATION
    const hasPrevStep = typeof history.state.back === 'string'
    const isRefresh = isInitNavigation && hasPrevStep

    // direction is correct only when forward or backward by .go() or user action
    // because pushState is called at the end of the navigation when calling push or replace
    const direction = history.state.position > position.value
      ? 'forward'
      : history.state.position < position.value
        ? 'backward'
        : 'unknown'

    return {
      direction,
      isInitNavigation,
      isRefresh,
      hasPrevStep,
      initPosition: initPosition.value,
      position: position.value,
    }
  }
  // string | ({ path: string } & Record<string, any>)

  const ctx = createContext()

  return {
    getNavigationInfo,
    goHistory,
    pushHistory,
    replaceHistory,
    context: ctx,
  }
}
