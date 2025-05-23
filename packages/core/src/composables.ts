import { computed } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { useRoute } from 'vue-router'

import type { TModalRouteOptions } from './core'
import type { TOpenModalOptions, TModalQueryRouteRecord } from './types'
import { modalRouteContext } from './modalRoute'
import { isGlobalModalRootRoute } from './core'
import { inject, onScopeDispose } from 'vue'
import { ModalRouteViewKey } from './components/ModalRouteView'
import { useMatchedRoute } from './utils'

/**
 * Get functions to open and close modal route.
 *
 * @returns functions to open and close modal route
 *
 * @example
 * const { openModal, closeModal, setupModal } = useModalRoute()
 *
 * openModal('ModalA')
 * closeModal('ModalA')
 * setupModal('ModalA', {
 *   props: (data) => {
 *     return {
 *       foo: data.foo,
 *     }
 *   },
 * })
 *
 */
export const useModalRoute = () => {
  const {
    closeModal,
    openModal,
  } = modalRouteContext.ensureInjection('useModalRoute must be used inside a ModalRoute component')
  return {
    setupModal,
    closeModal,
    openModal,
  }
}

/**
 * Setup a single modal route.
 *
 * Can setup props, slots, and other options for modal route.
 *
 * @param name name of modal route
 * @param options options to setup modal route
 * @returns functions to open and close modal route, and computed objects representing modal states
 *
 * @example
 * const { open, close, isActive, returnValue } = setupModal('ModalA', {
 *   props: (data) => {
 *     return {
 *       foo: data.foo,
 *     }
 *   },
 *   slots: {
 *     default: () => h('div', 'Hello'),
 *   },
 * })
 *
 */
export const setupModal = <ReturnValue = any>(
  name: string,
  options?: TModalRouteOptions,
) => {
  const {
    closeModal,
    openModal,
    relation,
    store,
  } = modalRouteContext.ensureInjection('setupModal must be used inside a ModalRoute component')

  // useModal can not target nested modal
  const matchedRoute = useMatchedRoute()
  const currentRoute = useRoute()
  const relatedModalInfo = relation.get(name)

  const inModalGlobalRoute = currentRoute.matched.some(r => isGlobalModalRootRoute(r))

  if (matchedRoute?.value) {
    if (relatedModalInfo.type === 'global' && !inModalGlobalRoute) {
      throw new Error(`useModal for first layer global modal must be used outside <RouterView>`)
    }
    if (relatedModalInfo.type === 'query') {
      throw new Error(`useModal for query modal must be used outside <RouterView>`)
    }
  }
  const checkIfModalIsChild = (children: RouteRecordRaw[]) => {
    for (const child of children) {
      if (child.name === name) {
        return true
      }
      if (child.children && checkIfModalIsChild(child.children)) {
        return true
      }
    }
    return false
  }
  let modalNameToOpen = name
  if (
    relatedModalInfo.type === 'path'
    || (inModalGlobalRoute && relatedModalInfo.type === 'global')
  ) {
    if (!checkIfModalIsChild(matchedRoute?.value?.children || [])) {
      throw new Error(`useModal ${name} must be used in a parent route of the modal.`)
    }

    const parentIndex = currentRoute.matched.findIndex(r =>
      matchedRoute?.value?.name === r.name && matchedRoute?.value?.path === r.path,
    )
    const openedModals = currentRoute.matched.slice(0, parentIndex + 1).flatMap(r => r.meta.modal ? [r.name as string] : [])
    const targetModals = relatedModalInfo.modals.filter((name: string) => !openedModals.includes(name))

    if (targetModals.length > 1) {
      throw new Error(`Multiple modals found for ${name}, useModal can only be used for single modal.`)
    }
    modalNameToOpen = targetModals[0]
  }

  const modal = store.get(modalNameToOpen)

  if (options) {
    try {
      modal.setOptions(options)
    }
    catch (_) {
      throw new Error(`useModal ${name} may be called in multiple place in same times. useModal for a name can only be used in one place at a time.`)
    }
    onScopeDispose(() => {
      modal.unsetOptions()
    })
    if (options?.manual) {
      modal.lock()
    }
  }
  const returnValue = useModalReturnValue<ReturnValue>(modalNameToOpen)
  const isActive = useModalActive(modalNameToOpen)

  return {
    // TODO: data here should not accept array of data, because `open` only open single modal.
    open: (options?: Partial<TOpenModalOptions>) => openModal(name, options),
    close: () => closeModal(modalNameToOpen),
    unlock: () => modal.unlock(),
    isActive,
    returnValue,
  }
}

/**
 * A composition function which target **current** modal route.
 *
 * Returns functions to open and close modal route, and computed objects representing modal states.
 *
 * @param name name of modal route
 * @returns functions to open and close modal route, and computed objects representing modal states
 *
 * @example
 * const { open, close, isActive, returnValue, closeThenReturn } = useCurrentModal()
 *
 * open()
 * close()
 * isActive.value
 * returnValue.value
 * closeThenReturn('foo')
 */
export function useCurrentModal<ReturnValue = unknown>() {
  const routeView = inject(ModalRouteViewKey)!
  const modal = useModal<ReturnValue>(routeView.name)
  const closeThenReturn = <R extends ReturnValue>(value: R) => {
    routeView.closeThenReturn(value)
  }
  return {
    ...modal,
    modelValue: routeView.visible,
    closeThenReturn,
  }
}

/**
 * A composition function which target a single modal route.
 *
 * Returns functions to open and close modal route, and computed objects representing modal states.
 *
 * @param name name of modal route
 * @returns functions to open and close modal route, and computed objects representing modal states
 *
 * @example
 * const { open, close, isActive, returnValue } = useModal('ModalA')
 *
 * open()
 * close()
 * isActive.value
 * returnValue.value
 */
export const useModal = <ReturnValue>(name: string) => {
  const {
    closeModal,
    openModal,
  } = modalRouteContext.ensureInjection('useModal must be used inside a ModalRoute component')

  return {
    /**
     * Open a modal route.
     *
     * @param options options to open modal route
     * @returns promise of modal route
     */
    open: (options?: Partial<TOpenModalOptions>) => openModal(name, options),
    /**
     * Close a modal route.
     */
    close: () => closeModal(name),
    /**
     * Computed object which value is true when modal route is active.
     */
    isActive: useModalActive(name),
    /**
     * Computed object which value is return value of modal route.
     */
    returnValue: useModalReturnValue<ReturnValue>(name),
  }
}

export const useModalReturnValue = <T>(name: string) => {
  const { store } = modalRouteContext.ensureInjection('useModalReturnValue must be used inside a ModalRoute component')
  const modal = store.get(name)
  return computed(() => modal.state.value.returnValue as T)
}

/**
 * Get a computed object which value is true when modal route is active.
 *
 * @param name name of modal route
 * @returns computed object which value is true when modal route is active
 *
 * @example
 * const isActive = useModalActive('ModalA')
 *
 * watch(isActive, (value) => {
 *   if (value) {
 *     console.log('ModalA is active')
 *   }
 * })
 */
export const useModalActive = (name: string) => {
  const { defineActive } = modalRouteContext.ensureInjection('useModalActive must be used inside a ModalRoute component')
  return computed(() => defineActive(name))
}

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
    setup: (options?: TModalRouteOptions) => setupModal<ReturnValue>(name, options),
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
    setup: (options?: TModalRouteOptions) => setupModal<ReturnValue>(name, options),
    use: () => useModal<ReturnValue>(name),
  }
}
