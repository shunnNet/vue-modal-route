import { computed, inject, unref } from 'vue'
import { createRouterMatcher, matchedRouteKey, RouteLocationMatched, RouteLocationNormalizedGeneric, RouteParamsGeneric, Router, RouteRecordNormalized, useRoute, viewDepthKey } from 'vue-router'

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

export function useNextRoute() {
  const route = useRoute()
  const injectedDepth = inject(viewDepthKey, 0)

  // From vue-router v4
  const depthNext = computed<number>(() => {
    let initialDepth = unref(injectedDepth)
    const { matched } = route
    let matchedRoute: RouteLocationMatched | undefined
    while (
      (matchedRoute = matched[initialDepth])
      && !matchedRoute.components
    ) {
      initialDepth++
    }
    return initialDepth
  })
  const nextRoute = computed(() => {
    const { matched } = route
    return matched[depthNext.value]
  })

  return {
    depthNext,
    nextRoute,
  }
}
