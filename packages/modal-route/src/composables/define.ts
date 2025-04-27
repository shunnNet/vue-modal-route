import { RouteRecordRaw } from 'vue-router'
import { TModalMapItem, TModalQueryRouteRecord } from '../types'
import { setupModal, useModal } from '../modalRoute'

/**
 * @experimental
 * Define a modal route and return functions to setup route and use it.
 *
 * User don't need to afraid of changing route name after using this function.
 *
 * @example
 * const ModalA = defineModalRoute<string>(
 *  'modal-a',
 *  () => import('./pages/page-single-modal/ModalA.vue'),
 *  { direct: true },
 * )
 *
 * ModalA.route() // RouteRecordRaw
 * const { open, close } = ModalA.setup() // Promise<string>
 *
 *
 */
export const defineModalRoute = <ReturnValue = any>(
  path: string,
  component: RouteRecordRaw['component'],
  options: {
    name?: string
    direct?: boolean
  } = {},
) => {
  // TODO: parse path to name like nuxt did
  const name = path
  return {
    name: options.name || name,
    route: (children?: RouteRecordRaw[]) => ({
      name,
      path,
      component,
      meta: {
        modal: true,
        direct: options.direct,
      },
      children,
    } as RouteRecordRaw),
    setup: (options?: TModalMapItem['options']) => setupModal<ReturnValue>(name, options),
    use: () => useModal<ReturnValue>(name),
  }
}

/**
 * @experimental
 * Define a modal query route and return functions to setup route and use it.
 *
 * User don't need to afraid of changing route name after using this function.
 */
export const defineModalQueryRoute = <ReturnValue = any>(
  path: string,
  component: TModalQueryRouteRecord['component'],
) => {
  const name = path
  return {
    name,
    route: () => ({
      name,
      component,
    }),
    setup: (options?: TModalMapItem['options']) => setupModal<ReturnValue>(name, options),
    use: () => useModal<ReturnValue>(name),
  }
}
