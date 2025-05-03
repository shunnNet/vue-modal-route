import { h, resolveComponent, defineComponent } from 'vue'
import ModalRouteView from './ModalRouteView'
import { modalQueryContext } from './ModalQueryView'

/**
 * A component that renders router view in modal route.
 *
 * Children routes of modal route have name prefix `modal-`.
 *
 * This component append the prefix to `RouteView` name prop for convenience.
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
      console.warn('ModalRouterView should not be nested in ModalQueryView.')
      return () => null
    }

    return () => {
      return h(
        resolveComponent('RouterView'),
        { name: `modal-${props.name}` },
        slots,
      )
    }
  },
})
