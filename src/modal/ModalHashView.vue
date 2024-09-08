<script setup lang="ts">
import { computed, provide } from 'vue'
import { useRoute, viewDepthKey } from 'vue-router'
import ModalRoute from './ModalRoute'
const routes = useRoute()
const hashRouteDepth = computed(() => {
  return routes.matched?.findIndex(r => r?.meta?.modalHashRoot === true)
})

provide(viewDepthKey, hashRouteDepth)
const parent = computed(() => {
  return routes.matched[hashRouteDepth.value - 1]
})

</script>
<template>
  <RouterView v-slot="{ Component }">
    <ModalRoute
      :component="Component"
      :parent="parent"
    />
  </RouterView>
</template>
<style></style>
