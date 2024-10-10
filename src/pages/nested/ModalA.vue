<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'
import { useModal, ModalPathView } from '~/modal'

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
const { open } = useModal('ModalNestedB')
</script>
<template>
  <ElDialog
    v-model="visible"
    title="Nested Modal A"
  >
    <div class="grid gap-2" />
    <ModalPathView />

    <template #footer>
      <ElButton
        type="primary"
        @click="open()"
      >
        Open ModalB
      </ElButton>
      <ElButton
        icon="Message"
        @click="$emit('message', 'Emit from ModalA')"
      >
        Send Message
      </ElButton>
      <ElButton
        type="warning"
        icon="close"
        @click="visible = false"
      >
        Close
      </ElButton>
      <ElButton
        type="success"
        icon="check"
        @click="$emit('return', 'ModalA return value')"
      >
        Confirm
      </ElButton>
    </template>
  </ElDialog>
</template>
<style></style>
