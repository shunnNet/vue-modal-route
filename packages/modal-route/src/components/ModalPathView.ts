import { h, resolveComponent, defineComponent } from 'vue'
import ModalRouteView from './ModalRouteView'
import { globalModalContext } from './ModalGlobalView'
import { modalQueryContext } from './ModalQueryView'

/**
 * A component that renders path modal route.
 *
 * Use this when you want to render path modal route.
 *
 * For normal children routes of modal route, use `ModalRouterView` instead.
 */
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
