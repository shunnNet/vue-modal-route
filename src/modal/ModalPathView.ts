import { inject, h, resolveComponent, defineComponent } from 'vue'
import ModalRoute from './ModalRouteView'
import { matchedRouteKey } from 'vue-router'

export default defineComponent({
  components: {
    ModalRoute,
  },
  setup(_, { slots }) {
    const matchedRoute = inject(matchedRouteKey)

    const RouterView = resolveComponent('RouterView')
    return () => {
      return h(RouterView, null, {
        default: (scope: any) => {
          return h(ModalRoute, {
            modalType: 'path',
            components: [scope.Component],
            parent: matchedRoute,
          }, slots)
        },

      })
    }
  },
})
