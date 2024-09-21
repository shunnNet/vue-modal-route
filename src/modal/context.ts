export const createContext = () => {
  let context: Record<string, any> = {}

  const reset = () => {
    context = {}
  }
  const append = (values: Record<string, any>) => {
    Object.entries(values).forEach(([key, value]) => {
      context[key] = value
    })
  }
  const get = () => context

  return {
    get,
    reset,
    append,
  }
}
