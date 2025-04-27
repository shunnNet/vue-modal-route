import { h, resolveComponent, defineComponent } from 'vue'
import ModalRouteView from './ModalRouteView'
import { globalModalContext } from './ModalGlobalView'
import { modalQueryContext } from './ModalQueryView'
import { useNextRoute } from './router'
import { isModalRouteRecordNormalized } from './helpers'

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

    const { nextRoute } = useNextRoute()

    const RouterView = resolveComponent('RouterView')
    const inGlobalModalRoute = globalModalContext.inject(false)

    return () => {
      const children = nextRoute.value && isModalRouteRecordNormalized(nextRoute.value)
        ? {
            default: (scope: any) => {
              return h(ModalRouteView, {
                modalType: inGlobalModalRoute ? 'global' : 'path',
                components: [scope.Component],
              }, slots)
            },
          }
        : slots
      return h(
        RouterView,
        { name: `modal-${props.name}` },
        children,
      )
    }
  },
})
