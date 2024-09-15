<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { ElDialog } from 'element-plus'
import ModalPathView from '~/modal/ModalPathView.vue'

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
const emit = defineEmits(['close'])
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
  emit('close', { message: 'Return from Modal A' })
}
</script>
<template>
  <ElDialog
    v-model="visible"
    :before-close="onBeforeClose"
  >
    <div v-loading="loading">
      {{ message }}
      <hr>
      <div>
        <slot>
          Default slot
        </slot>
      </div>
    </div>
    <ElButton @click="closeWithReturn">
      closeWithReturn
    </ElButton>
    <ModalPathView />
  </ElDialog>
</template>
<style></style>
