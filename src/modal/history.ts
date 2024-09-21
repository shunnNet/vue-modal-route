import { RouteLocationNormalizedGeneric, Router, RouterHistory, START_LOCATION } from 'vue-router'
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
  const position = { value: 0 }
  const initPosition = { value: history.state.position ?? 0 }

  // ex: forward
  // history.state.position change
  // router popstate handler called
  // afterEach called (lots of async functions (so its always call before macro task like popstate))
  // popstate called
  // popstate called (again, when failed to navigate)
  // we still need afterEach part to update the position when push or replace is called
  router.afterEach(() => {
    position.value = history.state.position as number
  })
  // position is correct in afterEach if successful navigation, but not if blocked by a guard
  // Although router run afterEach hook after playbacks the history by routerHistory.go
  // the .go() is a asynchronous, so the state still wrong when afterEach is called
  // to check the correct state we need to listen to popstate event in this case
  window.addEventListener('popstate', (e) => {
    position.value = e.state.position
  })

  let _goPromise: null | TDefer<PopStateEvent['state']> = null
  window.addEventListener('popstate', (e) => {
    // console.log('popstate', e.state)
    if (_goPromise) {
      _goPromise._resolve(e.state)
      _goPromise = null
    }
  })
  const goPromise = (delta: number, triggerListener: boolean = false) => {
    _goPromise = defer()
    routerHistory.go(delta, triggerListener)
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
    goPromise,
    getNavigationInfo,
    // modalBeforeEach,
    // modalAfterEach,
    setPosition: (pos: number) => {
      position.value = pos
    },
    context: ctx,
  }
}
