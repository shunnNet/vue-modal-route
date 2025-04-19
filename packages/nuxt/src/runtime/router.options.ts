import type { RouterConfig } from '@nuxt/schema'
import { transformToModalRoute } from './vmr'
import { createMemoryHistory, createWebHistory } from 'vue-router'
import type { RouterHistory, RouteRecordRaw } from 'vue-router'

export const history = {
  h: null as any as RouterHistory,
}
export const globalModal = [] as any[]

// function that remove /_modal/ from path recursively
function removeModalPath(route: RouteRecordRaw) {
  if (route.path.startsWith('/_modal/')) {
    route.path = route.path.replace('/_modal/', '')
    route.name = (route.name as string).replace('_modal-', '')
    route.meta = {
      ...route.meta,
      modal: true,
    }
  }
  if (route.children) {
    route.children.forEach(removeModalPath)
  }
  return route
}

export default {
  routes(_routes) {
    if (import.meta.client) {
      console.log('client')
      console.log(_routes)
    }
    const globals = _routes
      .filter(r => typeof r.name === 'string' && r.name.startsWith('_modal-'))
    // .forEach((r) => {
    //   globalModal.push(removeModalPath(r))
    // })

    const r = transformToModalRoute(
      _routes.filter(r => !(typeof r.name === 'string' && r.name.startsWith('_modal-'))),
    )

    globals.forEach((r) => {
      globalModal.push(removeModalPath(r))
    })
    console.log(globalModal)

    return r

    _routes.map((route) => {
      if (route.path.endsWith('.modal')) {
        const rr = { ...route }
        const component = rr.component
        delete rr.component
        return {
          ...rr,
          path: route.path.replace('.modal', ''),
          meta: {
            ...route.meta,
            modal: true,
          },
          components: {
            'modal-default': component!,
          },
        }
      }
      return route
    })

    return r
  },
  history(
    baseUrl,
  ) {
    console.log('history', 'baseUrl', baseUrl)
    history.h = import.meta.client ? createWebHistory(baseUrl) : createMemoryHistory(baseUrl)

    return history.h
  },
} satisfies RouterConfig
