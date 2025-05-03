<script setup lang="ts">
import LayoutDialog from './LayoutDialog'

defineProps({
  message: {
    type: String,
    default: '',
  },
})
</script>
<template>
  <LayoutDialog
    title="Query Modal A"
  >
    <div class="grid gap-2">Query Modal A</div>
    <div>Message: {{ message }}</div>
  </LayoutDialog>
</template>
<style></style>
