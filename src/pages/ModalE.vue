<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { ElDialog } from 'element-plus'
import ModalPathView from '~/modal/ModalPathView.vue'
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
  emit('close', { message: 'Return from Modal E' })
}
const { openModal } = useModalRoute()
</script>
<template>
  <ElDialog
    v-model="visible"
    :before-close="onBeforeClose"
  >
    Modal E

    <ElButton
      type="warning"
      @click="openModal('ModalB')"
    >
      Open Modal B
    </ElButton>
  </ElDialog>
</template>
<style></style>
