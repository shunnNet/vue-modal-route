<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { ElDialog } from 'element-plus'
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
  console.log('Hash Modal A Mounted !')
  console.log(visible)
})

onUnmounted(() => {
  // console.log('Modal A Unmounted !')
})
const { closeModal } = useModalRoute()
</script>
<template>
  <ElDialog
    v-model="visible"
    title="Hash Modal A"
    :before-close="onBeforeClose"
  >
    <div v-loading="loading">
      {{ message }}
    </div>
    <ElButton
      type="warning"
      @click="closeModal('ModalPH1')"
    >
      Close Modal PH1
    </ElButton>
  </ElDialog>
</template>
<style></style>
