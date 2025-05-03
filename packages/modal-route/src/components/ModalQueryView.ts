import { computed, defineComponent, h } from 'vue'
import ModalRoute from './ModalRouteView'
import { modalRouteContext } from '../modalRoute'
import { useMatchedRoute } from '../utils'
import { createContext } from '@vue-use-x/common'

export const modalQueryContext = createContext<boolean>()

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
    return () => {
      return h(ModalRoute, {
        modalType: 'query',
        components: componentsBeRendered.value,
      }, slots)
    }
  },
})
