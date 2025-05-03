<route lang="json">
{
  "meta": {
    "direct": true,
    "modal": true
  }
}
</route>

<script setup lang="ts">
import { ElButton, ElDrawer } from 'element-plus'
import { useModalRoute } from '@vmr/core'

const {  closeModal } = useModalRoute()

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
  <ElDrawer
    v-model="visible"
    title="Page Single Modal A"
  >
    <header
      v-if="$slots.header"
      class="mb-4"
    >
      <h4 class="text-2xl font-bold ">
        <slot name="header" />
      </h4>
    </header>
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
        type="warning"
        icon="close"
        @click="closeModal('/single/modal-a')"
      >
        Close with closeModal
      </ElButton>
      <ElButton
        type="success"
        icon="check"
        @click="$emit('return', 'ModalA return value')"
      >
        Close (with returnValue)
      </ElButton>
    </div>
  </ElDrawer>
</template>
