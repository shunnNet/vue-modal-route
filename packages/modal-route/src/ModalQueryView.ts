import { computed, defineComponent, h, inject } from 'vue'
import ModalRoute from './ModalRouteView'
import { useModalRoute, modalRouteContext } from './modalRoute'
import { matchedRouteKey } from 'vue-router'

export default defineComponent({
  components: {
    ModalRoute,
  },
  setup(_, { slots }) {
    const ctx = modalRouteContext.ensureInjection('useModalRoute must be used inside a ModalRoute component')
    const { isModalActive } = useModalRoute()
    const inModalQueryRoute = inject('ModalQueryContext', false)
    const inRouterView = inject(matchedRouteKey, null)
    if (inModalQueryRoute) {
      console.warn('ModalQueryView should not be nested in ModalQueryView.')
      return () => null
    }
    if (inRouterView !== null) {
      console.warn('ModalQueryView should not be nested inside router view.')
      return () => null
    }

    const componentsBeRendered = computed(
      () => ctx.queryRoutes
        .flatMap(modal => isModalActive(modal.name)
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
