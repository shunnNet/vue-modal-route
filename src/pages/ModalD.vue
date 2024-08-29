<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { ElDialog } from 'element-plus'

const onBeforeClose = (done: any) => {
  // console.log('Modal B Before Close !')
  done()
}
onMounted(() => {
  console.log('Modal C Mounted !')
})

onUnmounted(() => {
  // console.log('Modal B Unmounted !')
})
</script>
<template>
  <ElDialog
    :model-value="true"
  >
    <div>Modal D</div>
  </ElDialog>
</template>
<style></style>
