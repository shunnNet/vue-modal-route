import { h, resolveComponent, defineComponent } from 'vue'
import ModalRouteView from './ModalRouteView'
import { globalModalContext } from './ModalGlobalView'
import { modalQueryContext } from './ModalQueryView'

export default defineComponent({
  components: {
    ModalRouteView,
  },
  props: {
    name: {
      type: String,
      default: 'default',
    },
  },
  setup(props, { slots }) {
    const inModalQueryRoute = modalQueryContext.inject(false)
    if (inModalQueryRoute) {
      console.warn('ModalPathView should not be nested in ModalQueryView.')
      return () => null
    }

    const RouterView = resolveComponent('RouterView')
    const inGlobalModalRoute = globalModalContext.inject(false)

    return () => {
      return h(
        RouterView,
        { name: `modal-${props.name}` },
        {
          default: (scope: any) => {
            return h(ModalRouteView, {
              modalType: inGlobalModalRoute ? 'global' : 'path',
              components: [scope.Component],
            }, slots)
          },

        })
    }
  },
})
