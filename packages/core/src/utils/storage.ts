export const useSessionStorage = (name: string) => {
  const set = <T = any>(value: T) => {
    sessionStorage.setItem(name, JSON.stringify(value))
  }
  const get = <T = any>(): T | null => {
    const value = sessionStorage.getItem(name)
    return value ? JSON.parse(value) : null
  }
  const del = () => {
    sessionStorage.removeItem(name)
  }
  return { set, get, del }
}

export const createMemoryStorage = (name: string) => {
  const memoryStorage = new Map<string, any>()
  const set = <T = any>(value: T) => {
    memoryStorage.set(name, value)
  }
  const get = <T = any>(): T | null => {
    const value = memoryStorage.get(name)
    return value as T | null
  }
  const del = () => {
    memoryStorage.delete(name)
  }
  return { set, get, del }
}
