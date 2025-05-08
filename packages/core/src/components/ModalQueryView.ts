import { computed, defineComponent, h, shallowReactive, watch } from 'vue'
import ModalRoute, { modalProvider } from './ModalRouteView'
import { modalRouteContext } from '../modalRoute'
import { useMatchedRoute } from '../utils'
import { createContext } from '@vue-use-x/common'
import { TComponent } from '../types'

export const modalQueryContext = createContext<boolean>()

/**
 * A component that renders query modal route.
 *
 * Please put this component at root of App e.g: App.vue
 */
export default defineComponent({
  components: {
    ModalRoute,
  },
  setup(_, { slots }) {
    const ctx = modalRouteContext.ensureInjection('useModalRoute must be used inside a ModalRoute component')

    const inModalQueryRoute = modalQueryContext.inject(false)
    if (inModalQueryRoute) {
      console.warn('ModalQueryView should not be nested in ModalQueryView.')
      return () => null
    }

    const inRouterView = useMatchedRoute()
    if (inRouterView !== null) {
      console.warn('ModalQueryView should not be nested inside router view.')
      return () => null
    }

    modalQueryContext.provide(true)

    const componentsBeRendered = computed(
      () => ctx.queryRoutes
        .flatMap(modal => ctx.defineActive(modal.name)
          ? [{ modalName: modal.name, component: modal.component }]
          : [],
        ),
    )

    const componentMap: Record<string, TComponent> = shallowReactive({})

    watch(componentsBeRendered, (value) => {
      value.forEach(({ modalName, component }) => {
        componentMap[modalName] = component
      })
    }, { immediate: true })

    return () => {
      return Object.keys(componentMap).map((name) => {
        return h(
          modalProvider,
          { modal: componentMap[name], name },
          Object.fromEntries(
            Object.entries(slots).flatMap(([key, value]) => {
              const [parsedKey, slotName] = key.split('-')
              return parsedKey === name ? [[slotName, value]] : []
            }),
          ))
      })
    }
  },
})
