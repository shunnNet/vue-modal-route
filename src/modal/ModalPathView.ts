import { h, resolveComponent, defineComponent } from 'vue'
import ModalRoute from './ModalRouteView'

export default defineComponent({
  components: {
    ModalRoute,
  },
  setup(_, { slots }) {
    const RouterView = resolveComponent('RouterView')
    return () => {
      return h(RouterView, null, {
        default: (scope: any) => {
          return h(ModalRoute, {
            modalType: 'path',
            components: [scope.Component],
          }, slots)
        },

      })
    }
  },
})
