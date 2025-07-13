import type { RouterConfig } from '@nuxt/schema'
import { traverseRouteRecords } from '@vmrh/core' // TODO: I can put path in playground nuxt.config, but can't modify tsconfig in module root folder
import { createMemoryHistory, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { vmrhContext } from './context'

// TODO: refactor this function

function removeModalPrefix(route: RouteRecordRaw, isGlobal: boolean = false) {
  if (typeof route.name !== 'string') {
    return route
  }
  if (
    !(route.name.startsWith('_modal-')
      || (route.name.endsWith('.modal') && route.path.endsWith('.modal')))
  ) {
    return route
  }

  // Append '-' to represent child route
  if (route.name?.startsWith('_modal-')) {
    route.path = route.path.replace('/_modal/', '')
    route.name = (route.name as string).replace('_modal-', '')
  }
  if (route.name?.endsWith('.modal') && route.path.endsWith('.modal')) {
    route.path = route.path.replace('.modal', '')
    route.name = (route.name as string).replace('.modal', '')
  }
  route.meta = {
    ...route.meta,
    modal: true,
    global: isGlobal, // Note: because of weird routes when hot reload (nuxt 3.14), we need to mark global modal routes
  }

  // TODO: Correctly handle this with all cases
  route.components = {
    ...route.components,
    // @ts-expect-error - TODO: fix this
    'modal-default': route.component,
  }
  delete route.component
  return route
}

export default {
  // Note: weird, routes accept last time modified routes, not the original routes
  routes(_routes) {
    let results = [..._routes]
    const isGlobalModalRoute = (route: RouteRecordRaw) =>
      (typeof route.name === 'string' && route.path.startsWith('/_modal')) || route.meta?.global
    const hasGlobalModalPath = _routes.some(isGlobalModalRoute)
    // Standardize the modal route
    if (hasGlobalModalPath) {
      vmrhContext.global = traverseRouteRecords(
        results.filter(isGlobalModalRoute),
        r => removeModalPrefix(r, true),
      )
      results = results.filter(r => !isGlobalModalRoute(r))
    }
    results = traverseRouteRecords(results, removeModalPrefix)

    return results
  },
  history(
    baseUrl,
  ) {
    vmrhContext.history = import.meta.client ? createWebHistory(baseUrl) : createMemoryHistory(baseUrl)

    return vmrhContext.history
  },
} satisfies RouterConfig
