<script setup lang="ts">
import { ElButton } from 'element-plus'
import HighlightText from '~/components/HighlightText.vue'
import { useModalRoute } from '@vmr/vue-modal-route'
import LayoutDialog from '~/components/LayoutDialog'


defineProps({
  message: {
    type: String,
    default: '',
  },
})
const { openModal } = useModalRoute()
const onCrossPageOpenModal = () => {
  openModal('ModalNestedB')
}
</script>
<template>
  <LayoutDialog
    title="Cross Page Modal A"
  >
    <p
      v-if="message"
      class="mb-2"
    >
      Message:
      <HighlightText
        :message="message"
      />
    </p>
    <ElButton
      type="primary"
      @click="onCrossPageOpenModal"
    >
      Open Nested Modal B in Page "Nested"
    </ElButton>
  </LayoutDialog>
</template>
<style></style>
