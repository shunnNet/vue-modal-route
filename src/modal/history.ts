import { HistoryState, RouteLocationNormalizedGeneric, Router, RouterHistory, START_LOCATION } from 'vue-router'
import { deepClone, defer, TDefer } from './helpers'
import { useSessionStorage } from './storage'

export type TModalHistory = ReturnType<typeof useModalHistory>
type TvmrtTags = Record<string, string>

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

    // TODO: make it no need to do this twice
    let needSave = false
    Object.keys(_tags).forEach((key) => {
      if (parseFloat(key) >= position.value) {
        delete _tags[key]
        needSave = true
      }
    })
    Object.keys(tags).forEach((key) => {
      if (parseFloat(key) >= position.value) {
        delete tags[key]
        needSave = true
      }
    })
    if (needSave) {
      saveTags()
    }
  })

  window.addEventListener('beforeunload', () => {
    tags[`${getCurrentPosition()}`] = 'unload'
    saveTags()
  })
  const vmrtStorage = useSessionStorage<TvmrtTags>('vmrt')
  const { tags, _tags } = initTags()
  saveTags()

  function initTags() {
    const _tags: TvmrtTags = vmrtStorage.get() ?? {}
    let unloadPosition = -1
    Object.entries(_tags).forEach(([key, value]) => {
      if (parseFloat(key) >= initPosition.value) {
        // e.g: unload position, include unload position set by refresh
        delete _tags[key]
        return
      }
      if (value === 'unload') {
        // get last unload position
        unloadPosition = parseFloat(key)
      }
    })
    const tags = Object.fromEntries(
      Object.entries(deepClone(_tags) as TvmrtTags)
        .filter(([key]) => parseFloat(key) > unloadPosition),
    )

    return { tags, _tags }
  }

  function saveTags() {
    console.log('save', {
      ..._tags,
      ...tags,
    })
    vmrtStorage.set({
      ..._tags,
      ...tags,
    })
  }
  const tagHistory = (name: string, position: number = getCurrentPosition()) => {
    tags[`${position}`] = name
    routerHistory.replace(
      routerHistory.location,
      { ...routerHistory.state, vmrTag: name },
    )
    saveTags()
  }
  // get most last position has tag name
  const getPositionByTag = (name: string) => {
    for (const [key, value] of Object.entries(tags).reverse()) {
      if (value === name) {
        return parseFloat(key)
      }
    }
    return null
  }

  const pushHistory: RouterHistory['push'] = (to: string, data?: HistoryState) => {
    const r = routerHistory.push(to, data)
    position.value = getCurrentPosition()
    console.log('push', to, position.value)
    return r
  }
  const replaceHistory: RouterHistory['replace'] = (to: string, data?: HistoryState) => {
    const r = routerHistory.replace(to, data)
    position.value = getCurrentPosition()
    console.log('replace', to, position.value)
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
  const goHistory = (deltaOrTag: number | string, triggerListener: boolean = false) => {
    let delta = 0
    if (typeof deltaOrTag === 'number') {
      delta = deltaOrTag
    }
    else if (typeof deltaOrTag === 'string') {
      const p = getPositionByTag(deltaOrTag)
      if (p !== null) {
        delta = p - getCurrentPosition()
      }
      else {
        return Promise.reject(new Error(`History tag ${deltaOrTag} not found.`))
      }
    }
    else {
      return Promise.reject(new Error('Invalid argument type.'))
    }

    _goPromise = defer()
    console.log('go', delta, triggerListener)
    routerHistory.go(delta, triggerListener)
    _goPromise.then(() => {
      position.value = getCurrentPosition()
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
    pushHistory,
    replaceHistory,
    tagHistory,
    getCurrentPosition,
    getPositionByTag,
    initPosition: initPosition.value,
  }
}
