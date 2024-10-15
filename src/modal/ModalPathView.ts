import { h, resolveComponent, defineComponent, inject } from 'vue'
import ModalRoute from './ModalRouteView'

export default defineComponent({
  components: {
    ModalRoute,
  },
  props: {
    name: {
      type: String,
      default: 'default',
    },
  },
  setup(props, { slots }) {
    const RouterView = resolveComponent('RouterView')
    const inModalHashRoute = inject('ModalHashContext', false)
    const inModalQueryRoute = inject('ModalQueryContext', false)
    if (inModalQueryRoute) {
      console.warn('ModalPathView should not be nested in ModalQueryView.')
      return () => null
    }
    return () => {
      return h(
        RouterView,
        { name: `modal-${props.name}` },
        {
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
