<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { ElDialog } from 'element-plus'
import { useModalRoute, ModalPathView } from '~/modal'

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
  emit('return', { message: 'Return from Modal A' })
}
const { openModal } = useModalRoute()
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
    <ElButton
      type="success"
      @click="openModal('ModalB' )"
    >
      Open Modal B
    </ElButton>
    <RouterLink :to="{ name: 'ModalAChild'}">
      Modal Child A
    </RouterLink>
    <RouterView />
    <ModalPathView />
  </ElDialog>
</template>
<style></style>
