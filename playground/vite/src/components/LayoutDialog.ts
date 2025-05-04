import { defineComponent, h, resolveComponent } from "vue";
import { useCurrentModal } from "@vmrh/core";

export default defineComponent({
  setup(props, { slots }) {
    const { modelValue } = useCurrentModal()

    const dialog = resolveComponent('ElDialog')

    return () => h(dialog, {
      modelValue: modelValue.value,
      'onUpdate:modelValue': (value: boolean) => modelValue.value = value,
      ...props,
    }, slots)
  },
})
