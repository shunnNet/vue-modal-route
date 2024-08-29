<script setup lang="ts">
import { PropType } from 'vue'
import ModalRoute from './ModalRoute.vue'

defineProps({
  name: {
    type: String as PropType<string>,
    default: 'default',
  },
  // route: {
  //   type: Object as PropType<RouteLocationNormalizedLoaded>,
  //   default: () => null,
  // },
  modalData: {
    type: Object,
    default: () => ({}),
  },
})
</script>
<template>
  <RouterView
    v-slot="{Component }"
    :name="name"
  >
    <ModalRoute
      :component="Component"
      :modal-data="modalData"
    />
  </RouterView>
</template>
