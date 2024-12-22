<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('ModalB child route mounted')
})
</script>
<template>
  <div class="font-italic text-amber">
    Modal B child route
  </div>
</template>
<style></style>
