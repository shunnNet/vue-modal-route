<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'
import { ModalPathView } from '~/modal'

const visible = defineModel({
  type: Boolean,
  default: false,
})
defineProps({
  message: {
    type: String,
    default: '',
  },
})
defineEmits(['return', 'message'])
</script>
<template>
  <ElDialog
    v-model="visible"
    title="Query Modal A"
  >
    <div class="grid gap-2" />
    <!-- <ModalPathView /> -->
  </ElDialog>
</template>
<style></style>
