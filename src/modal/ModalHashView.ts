import { computed, defineComponent, h, inject, provide, resolveComponent } from 'vue'
import { useRoute, viewDepthKey, matchedRouteKey } from 'vue-router'
import ModalRoute from './ModalRouteView'
export default defineComponent({
  components: {
    ModalRoute,
  },
  setup(_, { slots }) {
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

    return () => {
      return h(RouterView, null, {
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
