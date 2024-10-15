import { inject, InjectionKey } from 'vue'
import { RouteRecordRaw } from 'vue-router'

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const ensureInjection = <T = unknown>(injectKey: string | InjectionKey<T>, errorMsg: string) => {
  const injection = inject(injectKey)

  if (!injection) {
    throw new Error(errorMsg)
  }

  return injection
}

export const isPlainObject = (value: unknown): value is Record<string, any> => {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Checks if a value is null or undefined.
 *
 * @param v - The value to check.
 * @returns True if the value is null or undefined, false otherwise.
 */
export const isNullish = (v: any) => v === null || v === undefined

/**
 * Ensures that the input value is converted to an array.
 * If the input value is nullish (undefined or null), an empty array is returned.
 * If the input value is already an array, it is returned as is.
 * If the input value is not an array, it is wrapped in an array and returned.
 *
 * @param v - The value to ensure as an array.
 * @returns An array containing the input value or a wrapped version of it.
 */
export const ensureArray = <T>(v: T | T[]) => isNullish(v) ? [] : Array.isArray(v) ? v : [v]

export type TDefer<T = any> = Promise<T> & {
  _resolve: (value: T) => void
  _reject: (reason?: any) => void
}
export const defer = <T = any>() => {
  let resolve: (value: T) => void
  let reject: (reason?: any) => void
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  }) as TDefer<T>
  promise._resolve = resolve!
  promise._reject = reject!
  return promise
}

export function once(fn: CallableFunction) {
  let called = false
  return (...args: any[]) => {
    if (called) {
      return
    }
    called = true
    return fn(...args)
  }
}

// export function createCallbacks() {
//   const callbacks: Array<() => any> = []

//   function addCallback(cb: () => any) {
//     callbacks.push(cb)
//     return () => {
//       const index = callbacks.indexOf(cb)
//       if (index > -1) {
//         callbacks.splice(index, 1)
//       }
//     }
//   }

//   function run(...params: any[]) {
//     return callbacks.map(cb => cb(...params))
//   }

//   return {
//     callbacks,
//     addCallback,
//     runCallback: run,
//   }
// }

export const noop = () => { }

export const isModalRoute = (route: RouteRecordRaw) => {
  return route.meta?.modal
}
export const transformToModalRoute = (routes: RouteRecordRaw[], inModalRoute: boolean = false) => {
  const prefix = 'modal-'
  return routes.map((aRoute) => {
    const result = {
      ...aRoute,
    } as RouteRecordRaw
    const children = Array.isArray(result.children)
      ? transformToModalRoute(result.children || [], true)
      : undefined
    result.children = children as RouteRecordRaw[]
    if (
      !(inModalRoute || (aRoute.meta?.modal && aRoute.name))
    ) {
      return result
    }
    if (aRoute.component) {
      result.components = {
        default: aRoute.component,
        ...(result.components ?? {}),
      }
      delete result.component
    }
    if (!(isPlainObject(result.components) && result.components.default)) {
      return result
    }
    result.components = Object.keys(result.components).reduce(
      (acc, key) => {
        acc[`${prefix}${key}`] = result.components![key]
        return acc
      },
      {} as Record<string, NonNullable<RouteRecordRaw['component']>>,
    )

    return result
  }) as RouteRecordRaw[]
}
