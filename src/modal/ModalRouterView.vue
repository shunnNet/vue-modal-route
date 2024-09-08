<script setup lang="ts">
import { inject } from 'vue'
import ModalRoute from './ModalRoute.vue'
import { matchedRouteKey } from 'vue-router'

defineProps({
  modalData: {
    type: Object,
    default: () => ({}),
  },
})
const matchedRoute = inject(matchedRouteKey)
</script>
<template>
  <RouterView v-slot="{ Component }">
    <ModalRoute
      :component="Component"
      :modal-data="modalData"
      :parent="matchedRoute"
    />
  </RouterView>
</template>
