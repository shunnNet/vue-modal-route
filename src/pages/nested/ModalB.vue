<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'
import { useModal } from '~/modal'

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
const { open } = useModal('ModalNestedA')
</script>
<template>
  <ElDialog
    v-model="visible"
    title="Nested Modal B"
  >
    <div class="grid gap-2" />

    <template #footer>
      <ElButton
        type="primary"
        @click="open()"
      >
        Open Parent ModalA
      </ElButton>
      <ElButton
        icon="Message"
        @click="$emit('message', 'Emit from ModalB')"
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
        @click="$emit('return', 'ModalB return value')"
      >
        Confirm
      </ElButton>
    </template>
  </ElDialog>
</template>
<style></style>
