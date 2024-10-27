<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'
import { ModalPathView, useModalRoute } from '@vmr/modal-route'
import HighlightText from './HighlightText.vue'

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
// const { open } = useModal('ModalHashB')
const { openModal } = useModalRoute()

</script>
<template>
  <ElDialog
    v-model="visible"
    title="Hash Modal A"
  >
    <div class="grid gap-2">
      <p v-if="message">
        Message: <HighlightText :message="message" />
      </p>
      <RouterLink :to="{ name: 'PagePrepare' }">
        Go to PagePrepare
      </RouterLink>
      <!-- <RouterLink :to="{ name: 'ModalHashAChild' }">
        Go to ModalHashAChild
      </RouterLink> -->
      <ElButton
        @click="openModal('ModalHashB',{
          data: { message: 'Message from ModalHashA' },
        })"
      >
        Open Hash Modal B
      </ElButton>
      <ElButton
        type="primary"
        @click="openModal('ModalQueryA',{
          data: { message: 'Message from ModalHashA' },
        })"
      >
        Open Modal Query A
      </ElButton>
    </div>
    <!-- TODO: problem -->
    <RouterView />
    <ModalPathView />
  </ElDialog>
</template>
<style></style>
