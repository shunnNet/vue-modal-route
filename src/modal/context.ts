export const createContext = () => {
  // Note: It's may break if trigger new navigation at afterEach
  // But may work if microtask queue finish all afterEach before next navigation guard queue
  let context: Record<string, any> = {}
  let nextContext: Record<string, any> = {}

  const reset = () => {
    context = nextContext
    nextContext = {}
  }
  const append = (values: Record<string, any>) => {
    Object.entries(values).forEach(([key, value]) => {
      context[key] = value
    })
  }
  const appendNext = (values: Record<string, any>) => {
    Object.entries(values).forEach(([key, value]) => {
      nextContext[key] = value
    })
  }
  const get = () => context

  return {
    get,
    reset,
    append,
    appendNext,
  }
}
