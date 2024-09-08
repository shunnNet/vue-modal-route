import { defineComponent, h, PropType, toRef, watch } from 'vue'
import { TComponent, setupModalRoute } from './setupModalRoute'

export default defineComponent({
  props: {
    component: {
      type: Object as PropType<TComponent>,
      default: null,
    },
    parent: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    const { setModal, componentMap } = setupModalRoute(toRef(() => props.parent))

    if (props.component?.type.__route_modal_name) {
      const name = props.component.type.__route_modal_name as string
      console.log(name)

      setModal(
        name,
        props.component,
      )
    }

    watch(() => props.component, (val) => {
      if (val) {
        const name = val.type.__route_modal_name as string
        setModal(name, val)
        console.log(val, name, componentMap[name].props)
      }
    })
    return () => {
      return Object.entries(componentMap).map(([name, { _component }]) => {
        const modal = componentMap[name]
        return h(_component, {
          ...modal.props,
          'modelValue': modal.visible,
          'onUpdate:modelValue': (value: boolean) => modal.visible = value,
          'loading': modal.loading,
        }, modal.slots)
      })
    }
  },
})

// <component
//   :is="_component"
//   v-for="{ _component }, name in componentMap"
//   :key="name"
//   v-bind="componentMap[name].props"
//   v-model="componentMap[name].visible"
//   :loading="componentMap[name].loading"
// >
//   <div>
//     {{ componentMap[name] }}
//     {{ name }}: {{ new Date().toLocaleTimeString() }}
//   </div>
// </component>
