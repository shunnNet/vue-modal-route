<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'
import HighlightText from '~/components/HighlightText.vue'
import { setupModal, ModalPathView } from '@vmr/vue-modal-route'

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
const { open } = setupModal('ModalNestedB')
</script>
<template>
  <ElDialog
    v-model="visible"
    title="Nested Modal A"
  >
    <div class="grid gap-2">
      <HighlightText
        v-if="message"
        :message="message"
      />
    </div>
    <ModalPathView />

    <template #footer>
      <ElButton
        type="primary"
        @click="open({
          data: [
            ['ModalNestedA', { message: 'ModalA message from ModalB (which should not be seen.)' }],
            ['ModalNestedB', { message: 'ModalB message from ModalA (should be shown)' }],
            ['ModalNestedBChild', { message: 'ModalBChild message from ModalA (which should not be seen.)' }]
          ]
        })"
      >
        Open ModalB
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
        Close (with Return Value)
      </ElButton>
    </template>
  </ElDialog>
</template>
<style></style>
