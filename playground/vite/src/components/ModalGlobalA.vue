<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useModalRoute } from '@vmrh/core'
import HighlightText from './HighlightText.vue'
import LayoutDialog from './LayoutDialog'

defineProps({
  message: {
    type: String,
    default: '',
  },
})
// const { open } = useModal('ModalHashB')
const { openModal } = useModalRoute()

</script>
<template>
  <LayoutDialog
    title="Global Modal A"
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
        Open Global Modal B
      </ElButton>
      <ElButton
        type="primary"
        @click="openModal('query-modal-a',{
          data: { message: 'Message from ModalHashA' },
        })"
      >
        Open Modal Query A
      </ElButton>
    </div>
    <!-- TODO: problem -->
    <RouterView />
    <ModalRouterView />
  </LayoutDialog>
</template>
<style></style>
