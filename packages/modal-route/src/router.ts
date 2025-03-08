import { inject } from 'vue'
import { createRouterMatcher, matchedRouteKey, RouteLocationNormalizedGeneric, RouteParamsGeneric, Router, RouteRecordNormalized } from 'vue-router'

export function useRouterUtils(router: Router) {
  const routerMatcher = createRouterMatcher(router.getRoutes(), router.options)
  const paramsToPath = (
    r: RouteRecordNormalized | RouteLocationNormalizedGeneric,
    params: RouteParamsGeneric,
  ) => {
    return routerMatcher.getRecordMatcher(r.name as string)?.stringify(params) || r.path
  }

  return {
    paramsToPath,
  }
}

export function useMatchedRoute() {
  return inject(matchedRouteKey, null)
}
