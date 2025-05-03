import { computed, defineComponent, h, toRef } from 'vue'
import { modalRouteContext } from '../modalRoute'

export default defineComponent({
  name: 'ModalLayout',
  props: {
    layout: {
      type: String,
      default: 'default',
    },
  },
  setup(props, { attrs, slots }) {
    const { layouts } = modalRouteContext.ensureInjection('ModalLayout must be used inside a ModalRoute component')
    const layout = toRef(props, 'layout')
    const component = computed(() => layouts[layout.value])

    return () => h(component.value, attrs, slots)
  },
})
