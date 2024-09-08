<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { ElButton, ElDialog } from 'element-plus'

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

defineEmits(['trigger'])
</script>
<template>
  <ElDialog
    v-model="visible"
    :before-close="onBeforeClose"
  >
    <div v-loading="loading">
      {{ message }}

      <ElButton
        type="primary"
        @click="$emit('trigger')"
      >
        Call Event
      </ElButton>
    </div>
  </ElDialog>
</template>
<style></style>
