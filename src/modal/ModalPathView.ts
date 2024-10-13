import { h, resolveComponent, defineComponent, inject } from 'vue'
import ModalRoute from './ModalRouteView'

export default defineComponent({
  components: {
    ModalRoute,
  },
  setup(_, { slots }) {
    const RouterView = resolveComponent('RouterView')
    const inModalHashRoute = inject('ModalHashContext', false)
    return () => {
      return h(RouterView, null, {
        default: (scope: any) => {
          return h(ModalRoute, {
            modalType: inModalHashRoute ? 'hash' : 'path',
            components: [scope.Component],
          }, slots)
        },

      })
    }
  },
})
