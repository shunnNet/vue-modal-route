import { defineComponent, h, PropType, toRef, watch } from 'vue'
import { TComponent, setupModalRoute } from './setupModalRoute'
import { matchedRouteKey } from 'vue-router'
import { ensureInjection } from './helpers'
import { modalRouteContextKey } from './modalRouteContext'

export default defineComponent({
  props: {
    components: {
      type: Array as PropType<TComponent[] | { modalName: string, component: TComponent }[]>,
      default: () => [],
    },
    parent: {
      type: Object,
      default: null,
    },
    modalType: {
      type: String as PropType<'path' | 'hash' | 'query'>,
      required: true,
    },
  },

  setup(props) {
    const { setModal, componentMap } = setupModalRoute(toRef(() => props.parent))
    const matchedRoute = ensureInjection(matchedRouteKey, 'ModalRoute component must be used inside a router view')
    const { getModalItemUnsafe } = ensureInjection(modalRouteContextKey, 'ModalRoute must be used inside a ModalRoute component')

    const setupModalIfExist = (cmp: TComponent, name?: string) => {
      if (!cmp) {
        return
      }
      const _name = name || matchedRoute.value?.name as string
      const modal = getModalItemUnsafe(_name)

      if (modal && modal.type === props.modalType) {
        setModal(_name, cmp)
      }
    }

    props.components.filter(Boolean).forEach(
      cmp => 'modalName' in cmp
        ? setupModalIfExist(cmp.component, cmp.modalName)
        : setupModalIfExist(cmp),
    )

    watch(() => props.components, (val) => {
      if (!val.length) {
        return
      }
      val.filter(Boolean).forEach(cmp => 'modalName' in cmp
        ? setupModalIfExist(cmp.component, cmp.modalName)
        : setupModalIfExist(cmp),
      )
    })
    return () => {
      return Object.entries(componentMap).map(([name, { _component }]) => {
        const modal = componentMap[name]
        return h(_component, {
          ...modal.props,
          'modelValue': modal.active,
          'onUpdate:modelValue': (value: boolean) => modal.active = value,
          'loading': modal.loading,
        }, modal.slots)
      })
    }
  },
})