<script setup lang="ts">
defineProps({
  message: {
    type: String,
    default: '',
  },
})
</script>
<template>
  <span
    v-if="message"
    class="text-green"
    v-text="message"
  />
</template>
<style></style>
