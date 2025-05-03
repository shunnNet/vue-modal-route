import type { RouteRecordNormalized, RouteRecordRaw } from 'vue-router'
import { isPlainObject } from './common'

type ModalRouteRecordRaw = RouteRecordRaw & {
  name: string
  meta: {
    modal: boolean
  }
  components: { 'modal-default': any }
}

type ModalRouteRecordNormalized = RouteRecordNormalized & {
  name: string
  meta: {
    modal: boolean
  }
  components: { 'modal-default': any }
}

export const shouldBeModalRouteRecord = (route: RouteRecordRaw) => {
  return !!route.meta?.modal && typeof route.name === 'string'
}

export const isModalRouteRecordRawNormalized = (route: RouteRecordRaw): route is ModalRouteRecordRaw => {
  return shouldBeModalRouteRecord(route)
    && !!route.components?.['modal-default']
}

export const isModalRouteRecordNormalized = (route: RouteRecordNormalized): route is ModalRouteRecordNormalized => {
  return shouldBeModalRouteRecord(route)
    && !!route.components?.['modal-default']
}

export const traverseRouteRecords = (
  routes: RouteRecordRaw[],
  callback: (route: RouteRecordRaw, inModalRoute: boolean) => RouteRecordRaw | undefined,
  inModalRoute: boolean = false,
) => {
  return routes.map((route) => {
    const result = callback(route, inModalRoute) ?? route
    if (Array.isArray(result.children)) {
      result.children = traverseRouteRecords(
        result.children,
        callback,
        inModalRoute || isModalRouteRecordRawNormalized(result),
      )
    }
    return result
  })
}
/**
 * @Internal
 *
 * Formalize the route view name with prefix "modal-" when "modal route" or "route in modal route"
 */
export const formalizeRouteRecord = (
  aRoute: RouteRecordRaw,
  inModalRoute: boolean = false,
): RouteRecordRaw => {
  const prefix = 'modal-'

  // Do nothing if it is not modal route or not in modal route
  if (!inModalRoute && !shouldBeModalRouteRecord(aRoute)) {
    return aRoute
  }

  const result = {
    ...aRoute,
  } as RouteRecordRaw

  if (aRoute.component) {
    result.components = {
      default: aRoute.component,
      ...(result.components ?? {}),
    }
    delete result.component
  }
  // Do nothing if it doesn't have components
  if (!(isPlainObject(result.components) && result.components.default)) {
    return result
  }
  // Append prefix to the named views
  result.components = Object.keys(result.components).reduce(
    (acc, key) => {
      acc[`${prefix}${key}`] = result.components![key]
      return acc
    },
    {} as Record<string, NonNullable<RouteRecordRaw['component']>>,
  )

  return result
}
