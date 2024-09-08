import { inject, InjectionKey } from 'vue'
import { RouteRecordRaw, RouteRecordSingleViewWithChildren } from 'vue-router'

export const defineModalRoute = (route: RouteRecordRaw & { name: string }) => {
  route.meta = {
    modal: true,
  }
  route.component.__route_modal_name = route.name
  return route
}

export const defineHashModalRoute = (routes: (RouteRecordRaw & { name: string })[]) => {
  return {
    name: 'modal-hash-root',
    path: '#',
    meta: {
      modalHashRoot: true,
    },
    children: routes,
  } satisfies RouteRecordSingleViewWithChildren
}

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
