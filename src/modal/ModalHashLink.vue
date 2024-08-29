<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  hashValue: {
    type: String,
    default: '',
  },
})
const route = useRoute()
const _route = computed(() => {
  const result = {}
  Object.keys(route).forEach((key) => {
    result[key] = route[key]
  })
  result.hash = `#${props.hashValue}`
  return result
})
</script>
<template>
  <RouterLink
    :to="_route"
  >
    <template #default>
      <slot />
    </template>
  </RouterLink>
</template>
<style></style>
