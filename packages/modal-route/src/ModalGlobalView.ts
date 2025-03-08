import { computed, defineComponent, h, provide, resolveComponent } from 'vue'
import { useRoute, viewDepthKey } from 'vue-router'
import ModalRoute from './ModalRouteView'
import { useMatchedRoute } from './router'
import { isGlobalModalRootRoute } from './global'
import { createContext } from '@vue-use-x/common'

export const globalModalContext = createContext<boolean>()

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
    const routes = useRoute()
    const globalModalRootRouteDepth = computed(() => routes.matched?.findIndex(r => isGlobalModalRootRoute(r)))

    const inGlobalModalRoute = globalModalContext.inject()
    if (inGlobalModalRoute) {
      console.warn('ModalGlobalView should not be nested in another ModalGlobalView, use `ModalPathView` instead')
      return () => null
    }

    const inRouterView = useMatchedRoute()
    if (inRouterView !== null) {
      console.warn('ModalGlobalView should not be nested inside router view.')
      return () => null
    }

    provide(viewDepthKey, globalModalRootRouteDepth)
    globalModalContext.provide(true)

    const RouterView = resolveComponent('RouterView')

    // routerView accept route as prop, which will used to get the matched route component
    // when there is no matched route component, it will fallback to use slot content
    // We need to prevent render other route component after leave global route
    // so we pass an empty route when global route is not matched
    const emptyRoute = {
      matched: [],
    }

    return () => {
      return h(
        RouterView,
        {
          route: globalModalRootRouteDepth.value === -1 ? emptyRoute : null,
          name: `modal-${props.name}`,
        },
        {
          default: (scope: any) => {
            return h(ModalRoute, {
              modalType: 'global',
              components: [scope.Component],
            }, slots)
          },
        })
    }
  },
})
