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
