<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { ElDialog } from 'element-plus'
import { useModalRoute } from '~/modal'

const { openModal } = useModalRoute()

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
    default: '',
  },
})
const emit = defineEmits(['return'])
const onBeforeClose = (done: any) => {
  // console.log('Modal A Before Close !')
  done()
}
onMounted(() => {
  // console.log('Modal A Mounted !')
})

onUnmounted(() => {
  // console.log('Modal A Unmounted !')
})
const closeWithReturn = () => {
  // console.log('Close with return !')
  emit('return', { message: 'Return from ModalPH1' })
}
</script>
<template>
  <ElDialog
    v-model="visible"
    :before-close="onBeforeClose"
  >
    Modal PH 1
    <ElButton
      type="success"
      @click="openModal('hash-modal-a')"
    >
      open hash modal a
    </ElButton>
  </ElDialog>
</template>
<style></style>
