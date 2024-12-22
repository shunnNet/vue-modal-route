<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'
import { onMounted } from 'vue'
import HighlightText from '~/components/HighlightText.vue'
import { useModalRoute } from '@vmr/vue-modal-route'

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
const { openModal } = useModalRoute()
const onCrossPageOpenModal = () => {
  openModal('ModalNestedB')
}
onMounted(() => {
  console.log('ModalA mounted')
})
</script>
<template>
  <ElDialog
    v-model="visible"
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
  </ElDialog>
</template>
<style></style>
