import { defineComponent, h } from 'vue'
import { RouterView } from 'vue-router'

/**
 * Component to display the current route the user is at.
 */
export default defineComponent({
  props: {
    name: {
      type: String,
      default: 'default',
    },
  },
  setup(props, { slots }) {
    return () => {
      return h(
        RouterView,
        { name: `modal-${props.name}` },
        typeof slots.default === 'function'
          ? { default: (scope: any) => slots?.default?.(scope) || null }
          : undefined)
    }
  },
})
