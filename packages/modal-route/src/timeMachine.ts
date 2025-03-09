import { deepClone, defer, TDefer } from './helpers'
import { useSessionStorage } from './storage'

type TvmrtTags = Record<string, string>

type His = {
  replace: any
  go: any
  push: any
  state: any
  location: any
}

type TRewriteItem = {
  path: string
  state?: Record<string, any>
  tag?: string | ((path: string, index: number) => string | null | undefined | false)
  tagOffset?: number
  stay?: boolean
}

export const useTimemachine = (history: His) => {
  const getCurrentPosition = () => history.state.position

  const vmrtStorage = useSessionStorage<TvmrtTags>('vmrt')
  const { tags, _tags } = initTags()
  saveTags()

  window.addEventListener('beforeunload', () => {
    tags[`${getCurrentPosition()}`] = 'unload'
    saveTags()
  })
  window.addEventListener('popstate', () => {
    const pos = getCurrentPosition()
    console.log('current position', pos)
    // TODO: make it no need to do this twice
    let needSave = false
    Object.keys(_tags).forEach((key) => {
      if (parseFloat(key) >= pos) {
        delete _tags[key]
        needSave = true
      }
    })
    Object.keys(tags).forEach((key) => {
      if (parseFloat(key) >= pos) {
        delete tags[key]
        needSave = true
      }
    })
    if (needSave) {
      saveTags()
    }
  })

  function initTags() {
    const _tags: TvmrtTags = vmrtStorage.get() ?? {}
    let unloadPosition = -1
    Object.entries(_tags).forEach(([key, value]) => {
      if (parseFloat(key) >= getCurrentPosition()) {
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
    vmrtStorage.set({
      ..._tags,
      ...tags,
    })
  }
  const tagHistory = (name: string, position: number = getCurrentPosition()) => {
    tags[`${position}`] = name
    history.replace(
      history.location,
      { ...history.state, vmrTag: name },
    )
    console.log('tag', name, position)
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

  const goAsync = useGoAsync(history)

  let _goPromise: null | TDefer<PopStateEvent['state']> = null
  window.addEventListener('popstate', (e) => {
    // console.log('popstate', e.state)
    if (_goPromise) {
      _goPromise._resolve(e.state)
      _goPromise = null
    }
  })

  function useGoAsync(history: His) {
    return (deltaOrTag: number | string, triggerListener?: boolean) => {
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

      if (delta === 0) {
        return Promise.resolve(history.state)
      }
      console.log('current position', getCurrentPosition())

      console.log(
        'go to tag position',
        delta,
        typeof deltaOrTag === 'string' ? deltaOrTag : '',
      )

      let _goPromise: null | TDefer<PopStateEvent['state']> = defer()
      const onPopState = (e: PopStateEvent) => {
        if (_goPromise) {
          _goPromise._resolve(e.state)
          _goPromise = null
        }
        window.removeEventListener('popstate', onPopState)
      }
      window.addEventListener('popstate', onPopState)

      history.go(delta, triggerListener)

      return _goPromise
    }
  }
  async function rewriteFrom(
    tagOrDelta: string | number,
    items: (TRewriteItem | string)[],
    triggerListener?: boolean,
    current?: boolean,
  ) {
    await goAsync(tagOrDelta, triggerListener)
    return write(items, current)
  }

  async function write(items: (TRewriteItem | string)[], current?: boolean) {
    console.log(tags)
    console.log('position', getCurrentPosition())
    let stay = -1
    items.forEach((item, index) => {
      const path = typeof item === 'string' ? item : item.path
      const state = typeof item === 'string' ? undefined : item.state
      if (current && index === 0) {
        history.replace(path, state)
        console.log('replace', path, getCurrentPosition())
      }
      else {
        history.push(path, state)
        console.log('push', path, getCurrentPosition())
      }
      if (typeof item === 'string') {
        return
      }

      if (item.stay) {
        stay = index
      }

      const tag = typeof item.tag === 'function'
        ? item.tag(item.path, index)
        : item.tag
      if (tag) {
        tagHistory(
          tag,
          item.tagOffset !== undefined ? getCurrentPosition() + item.tagOffset : undefined,
        )
      }
    })
    if (stay !== -1) {
      await goAsync(1 - items.length + stay)
    }
    console.log('end position', getCurrentPosition())
  }

  return {
    goHistory: goAsync,
    tagHistory,
    getPositionByTag,
    write,
    rewriteFrom,
  }
}
