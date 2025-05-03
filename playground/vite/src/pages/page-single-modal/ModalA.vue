<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useCurrentModal, useModalRoute } from '@vmr/core'
import { QueryModalA } from '~/modals'
import LayoutDialog from '~/components/LayoutDialog'

const { openModal, closeModal } = useModalRoute()
const { closeThenReturn, close } = useCurrentModal()


defineProps({
  message: {
    type: String,
    default: '',
  },
})
defineEmits([ 'message'])
const onOpenGlobalModal = () => {
  openModal('ModalGlobalA').then((v) => {
    console.log('ModalGlobalA return', v)
  })
}
const { open: openQueryModalA } = QueryModalA.use()
const onOpenQueryModal = () => {
  openQueryModalA({
    // Query should be append
    query: { additionQuery: 'query1' },
    // Hash should be ignore
    // hash: '#hash',
  }).then((v) => {
    console.log('ModalQueryA return', v)
  })
}
</script>
<template>
  <LayoutDialog title="Page Single Modal A">
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
        @click="close"
      >
        Close
      </ElButton>
      <ElButton
        type="warning"
        icon="close"
        @click="closeModal('modal-a')"
      >
        Close with closeModal
      </ElButton>
      <ElButton
        type="success"
        icon="check"
        @click="closeThenReturn('ModalA return value')"
      >
        Close (with returnValue)
      </ElButton>
      <ElButton
        type="primary"
        @click="onOpenGlobalModal"
      >
        OpenGlobalModal
      </ElButton>
      <ElButton
        type="primary"
        @click="onOpenQueryModal"
      >
        OpenQueryModal
      </ElButton>
    </div>
  </LayoutDialog>
</template>
<style></style>
