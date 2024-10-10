<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'
import { useRoute } from 'vue-router'

const visible = defineModel({
  type: Boolean,
  default: false,
})
defineEmits(['return'])
const route = useRoute()
</script>
<template>
  <ElDialog
    v-model="visible"
    title="Page Single Modal B"
  >
    <p>Params.id: {{ route.params.id }}</p>
    <p>Close: no returnValue</p>
    <p>Confirm: 'ModalB return value'</p>
    <RouterView />
    <template #footer>
      <ElButton
        type="warning"
        icon="close"
        @click="visible = false"
      >
        Close
      </ElButton>
      <ElButton
        type="success"
        icon="check"
        @click="$emit('return', 'ModalB return value')"
      >
        Confirm
      </ElButton>
    </template>
  </ElDialog>
</template>
<style></style>
