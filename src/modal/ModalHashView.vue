<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import { useRoute } from 'vue-router'

const modalRoutes = inject('modalRoutes')
const routeParent = inject('routeParent')

const route = useRoute()
const hash = computed(() => routeParent?.value?.hash || route.hash || '')
const hashGroup = computed(() => hash.value ? hash.value.slice(1).split('-') : [])
const nowHash = computed(() => hashGroup.value[0])

const routeOptions = computed(() => {
  return routeParent?.value?.children || modalRoutes || []
})
const currentRoute = computed(() => {
  return routeOptions.value.find(option => option.name === nowHash.value)
})
const routeContext = computed(() => {
  const nextHashGroup = hashGroup.value.slice(1)
  const result = {
    hash: nextHashGroup.length ? `#${nextHashGroup.join('-')}` : '',
    children: currentRoute.value?.children || [],
  }
  console.log(result)
  return result
})
// console.log(routeParent, hash.value, hashGroup.value)
provide('routeParent', routeContext)
</script>
<template>
  {{ routeContext }}

  <component
    :is="currentRoute.component"
    v-if="currentRoute"
    :key="currentRoute.name"
  />
</template>
<style></style>
