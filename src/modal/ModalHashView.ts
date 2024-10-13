import { computed, defineComponent, h, provide, resolveComponent } from 'vue'
import { useRoute, viewDepthKey } from 'vue-router'
import ModalRoute from './ModalRouteView'
export default defineComponent({
  components: {
    ModalRoute,
  },
  setup(_, { slots }) {
    const routes = useRoute()
    const hashRouteDepth = computed(() => {
      return routes.matched?.findIndex(r => r?.meta?.modalHashRoot === true)
    })

    provide(viewDepthKey, hashRouteDepth)
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
