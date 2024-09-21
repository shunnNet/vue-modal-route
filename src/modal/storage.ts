export const useSessionStorage = () => {
  const set = (key: string, value: any) => {
    sessionStorage.setItem(key, JSON.stringify(value))
  }
  const get = (key: string) => {
    const value = sessionStorage.getItem(key)
    return value ? JSON.parse(value) : null
  }
  const del = (key: string) => {
    sessionStorage.removeItem(key)
  }
  return { set, get, del }
}
