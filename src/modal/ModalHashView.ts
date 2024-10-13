import { computed, defineComponent, h, provide, resolveComponent } from 'vue'
import { useRoute, viewDepthKey } from 'vue-router'
import ModalRoute from './ModalRouteView'
export default defineComponent({
  components: {
    ModalRoute,
  },
  setup(_, { slots }) {
    const routes = useRoute()
    const hashRouteDepth = computed(() => routes.matched?.findIndex(r => r?.meta?.modalHashRoot === true))
    const inModalHashRoute = inject('ModalHashContext', false)
    if (inModalHashRoute) {
      console.warn('ModalHashView should not be nested in another ModalHashView, use `ModalPathView` instead')
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
