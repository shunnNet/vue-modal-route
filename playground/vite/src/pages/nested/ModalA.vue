<script setup lang="ts">
import { ElButton } from 'element-plus'
import HighlightText from '~/components/HighlightText.vue'
import { setupModal, ModalPathView, useCurrentModal } from '@vmr/core'
import LayoutDialog from '~/components/LayoutDialog'

defineProps({
  message: {
    type: String,
    default: '',
  },
})
defineEmits(['return', 'message'])
const { open } = setupModal('ModalNestedB')
const { close, closeThenReturn } = useCurrentModal()
</script>
<template>
  <LayoutDialog title="Nested Modal A">
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
        @click="close"
      >
        Close
      </ElButton>
      <ElButton
        type="success"
        icon="check"
        @click="closeThenReturn('ModalA return value')"
      >
        Close (with Return Value)
      </ElButton>
    </template>

</LayoutDialog>
</template>
<style></style>
