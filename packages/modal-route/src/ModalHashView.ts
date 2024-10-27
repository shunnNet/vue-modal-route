import { computed, defineComponent, h, inject, provide, resolveComponent } from 'vue'
import { useRoute, viewDepthKey, matchedRouteKey } from 'vue-router'
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
    const routes = useRoute()
    const hashRouteDepth = computed(() => routes.matched?.findIndex(r => r?.meta?.modalHashRoot === true))
    const inRouterView = inject(matchedRouteKey, null)
    const inModalHashRoute = inject('ModalHashContext', false)
    if (inModalHashRoute) {
      console.warn('ModalHashView should not be nested in another ModalHashView, use `ModalPathView` instead')
      return () => null
    }
    if (inRouterView !== null) {
      console.warn('ModalHashView should not be nested inside router view.')
      return () => null
    }
    provide(viewDepthKey, hashRouteDepth)
    provide('ModalHashContext', true)
    const RouterView = resolveComponent('RouterView')

    // routerView accept route as prop, which will used to get the matched route component
    // when there is no matched route component, it will fallback to use slot content
    // We need to prevent render other route component after leave hash route
    // so we pass an empty route when hash route is not matched
    const emptyRoute = {
      matched: [],
    }

    return () => {
      return h(
        RouterView,
        {
          route: hashRouteDepth.value === -1 ? emptyRoute : null,
          name: `modal-${props.name}`,
        },
        {
          default: (scope: any) => {
            return h(ModalRoute, {
              modalType: 'hash',
              components: [scope.Component],
            }, slots)
          },
        })
    }
  },
})
