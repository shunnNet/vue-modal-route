import { defineComponent, h, PropType, toRef, watch } from 'vue'
import { TComponent, setupModalRoute } from './setupModalRoute'

export default defineComponent({
  props: {
    components: {
      type: Array as PropType<TComponent[]>,
      default: () => [],
    },
    parent: {
      type: Object,
      default: null,
    },
  },

  setup(props) {
    const { setModal, componentMap } = setupModalRoute(
      toRef(() => props.parent),
    )
    const getName = (cmp: TComponent) => {
      return cmp && (cmp?.type?.__route_modal_name || cmp.__route_modal_name)
    }

    // TODO: This make component can only be used in one place
    props.components.forEach((cmp) => {
      const name = getName(cmp) as string
      if (name) {
        setModal(name, cmp)
      }
    })

    watch(() => props.components, (val) => {
      if (!val.length) {
        return
      }
      val.forEach((cmp) => {
        const name = getName(cmp) as string
        if (name) {
          setModal(name, cmp)
        }
      })
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
