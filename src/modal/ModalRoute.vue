<script setup lang="ts">
import { PropType, watch } from 'vue'
import { TComponent, useModalRoute } from '~/modal/useModalRoute'

const { setComponent, componentMap } = useModalRoute()

const props = defineProps({
  component: {
    type: Object as PropType<TComponent>,
    default: null,
  },
  modalData: {
    type: Object,
    default: () => ({}),
  },
})
if (props.component?.type.__route_modal_name) {
  const name = props.component.type.__route_modal_name as string
  console.log(name)

  setComponent(
    name,
    props.component,
    props.modalData[name],
  )
}

watch(() => props.component, (val) => {
  if (val) {
    const name = val.type.__route_modal_name as string
    setComponent(name, val, props.modalData[name])
  }
})

</script>
<template>
  <component
    :is="_component"
    v-for="{ _component }, name in componentMap"
    :key="name"
    v-bind="componentMap[name].data"
    v-model="componentMap[name].visible"
    :loading="componentMap[name].loading"
  >
    <div>
      {{ name }}: {{ new Date().toLocaleTimeString() }}
    </div>
  </component>
</template>
<style></style>
