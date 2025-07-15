import { HistoryState, RouteLocationNormalizedGeneric, Router, RouterHistory, START_LOCATION } from 'vue-router'
import { useTimemachine } from './timeMachine'

export type TModalHistory = ReturnType<typeof useModalHistory>

// Note: enter the same url as current => position not change => same as refresh
// enter different url => position + 1 => forward

export const useModalHistory = (options: {
  router: Router
  routerHistory: RouterHistory
}) => {
  const _options = {
    ...options,
  }
  const router = _options.router
  const routerHistory = _options.routerHistory
  const getCurrentPosition = () => routerHistory.state.position as number
  const initPosition = { value: getCurrentPosition() ?? 0 }
  const position = { value: initPosition.value }

  router.afterEach((_to, _from, failure) => {
    if (failure) {
      return
    }
    position.value = getCurrentPosition()
  })

  const push = routerHistory.push
  const replace = routerHistory.replace

  const pushHistory: RouterHistory['push'] = (to: string, data?: HistoryState) => {
    const r = push(to, data)
    position.value = position.value + 1
    // console.log('push', to, position.value)
    return r
  }
  const replaceHistory: RouterHistory['replace'] = (to: string, data?: HistoryState) => {
    const r = replace(to, data)
    position.value = getCurrentPosition()
    // console.log('replace', to, position.value)
    return r
  }

  routerHistory.push = pushHistory
  routerHistory.replace = replaceHistory

  const {
    goHistory,
    tagHistory,
    getPositionByTag,
    write,
    rewriteFrom,
  } = useTimemachine(routerHistory,
    // push: pushHistory,
    // replace: replaceHistory,
  )

  const getNavigationInfo = (
    to: RouteLocationNormalizedGeneric,
    from: RouteLocationNormalizedGeneric,
  ) => {
    const isInitNavigation
      = from === START_LOCATION
      || to.fullPath === from.fullPath // Note: in SSR
    // const hasPrevStep = typeof history.state.back === 'string' // TODO: check if it's correct
    const hasPrevStep = typeof routerHistory.state.back === 'string' // TODO: check if it's correct
    const isRefresh = isInitNavigation && hasPrevStep

    // direction is correct only when forward or backward by .go() or user action
    // because pushState is called at the end of the navigation when calling push or replace
    const direction = getCurrentPosition() > position.value
      ? 'forward'
      : getCurrentPosition() < position.value
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

  return {
    getNavigationInfo,
    goHistory,
    tagHistory,
    getPositionByTag,
    writeHistory: write,
    rewriteFrom,
    pushHistory,
    replaceHistory,
    getCurrentPosition,
    initPosition: initPosition.value,
  }
}
