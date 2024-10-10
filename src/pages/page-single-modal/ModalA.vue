<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'

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
    title="Page Single Modal A"
  >
    <div class="grid gap-2">
      <p>Close: no returnValue</p>
      <p>Confirm: 'ModalA return value'</p>
      <p>
        Message from data:
        <span
          v-if="message"
          class="text-green"
          v-text="message"
        />
      </p>
      <slot name="footer" />
    </div>

    <template #footer>
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
