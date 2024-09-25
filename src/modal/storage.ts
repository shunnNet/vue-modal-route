export const useSessionStorage = <T>(name: string) => {
  const set = (value: T) => {
    sessionStorage.setItem(name, JSON.stringify(value))
  }
  const get = () => {
    const value = sessionStorage.getItem(name)
    return value ? JSON.parse(value) : null as T | null
  }
  const del = () => {
    sessionStorage.removeItem(name)
  }
  return { set, get, del }
}
