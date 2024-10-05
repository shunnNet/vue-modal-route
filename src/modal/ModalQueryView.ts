import { computed, defineComponent, h } from 'vue'
import ModalRoute from './ModalRouteView'
import { useRoute } from 'vue-router'
import { ensureInjection } from './helpers'
import { modalRouteContextKey, useModalRoute } from './modalRoute'

export default defineComponent({
  components: {
    ModalRoute,
  },
  setup(_, { slots }) {
    const route = useRoute()
    const ctx = ensureInjection(modalRouteContextKey, 'useModalRoute must be used inside a ModalRoute component')
    const { isModalActive } = useModalRoute()

    const componentsBeRendered = computed(
      () => ctx.queryRoutes
        .flatMap(modal => isModalActive(modal.name) ? [{ modalName: modal.name, component: modal.component }] : []),
    )
    const parent = computed(() => {
      return route.matched.at(-1)
    })

    return () => {
      return h(ModalRoute, {
        modalType: 'query',
        components: componentsBeRendered.value,
        parent,
      }, slots)
    }
  },
})
