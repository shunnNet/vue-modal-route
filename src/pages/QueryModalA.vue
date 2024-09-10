<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { ElButton, ElDialog } from 'element-plus'
import { useModalRoute } from '~/modal'

const visible = defineModel({
  type: Boolean,
  default: false,
})
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: 'default message',
  },
})
const onBeforeClose = (done: any) => {
  // console.log('Modal A Before Close !')
  done()
}
onMounted(() => {
  console.log('Query Modal A Mounted !')
  console.log(visible.value)
})

onUnmounted(() => {
  // console.log('Modal A Unmounted !')
})
const { openModal } = useModalRoute()
</script>
<template>
  <ElDialog
    v-model="visible"
    title="Query Modal A"
    :before-close="onBeforeClose"
  >
    <div v-loading="loading">
      {{ message }}
    </div>
    <ElButton
      type="primary"
      @click="openModal('query-modal-b')"
    >
      Open query b
    </ElButton>
  </ElDialog>
</template>
<style></style>
