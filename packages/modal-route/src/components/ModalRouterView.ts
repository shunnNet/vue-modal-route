import { h, resolveComponent, defineComponent } from 'vue'
import ModalRouteView from './ModalRouteView'
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
