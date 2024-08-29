<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { ElDialog } from 'element-plus'
import ModalHashView from '~/modal/ModalHashView.vue'
import ModalHashLink from '~/modal/ModalHashLink.vue'

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
    <div>Modal C</div>
    <ModalHashLink hash-value="modalc-modald">
      Modal D
    </ModalHashLink>
    <ModalHashView />
  </ElDialog>
</template>
<style></style>
