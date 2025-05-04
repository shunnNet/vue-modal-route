<script setup lang="ts">
import { useModalRoute } from '@vmrh/core'
definePageMeta({
  // name: "hello",
  direct: true,
  injectFromComponent: true,
})
const visible = defineModel({
  type: Boolean,
  default: false,
})
defineProps({
  message: {
    type: String,
    default: '',
  },
})

const { openModal } = useModalRoute()
</script>

<template>
  <Modal v-model="visible">
    <template #header>
      <h1>User Modal</h1>
    </template>
    <template #body>
      <p>{{ message }}</p>
    </template>
    <template #footer>
      <button @click="visible = false">Close</button>
      <button @click="openModal('login.modal')">Open Login Modal</button>
    </template>
  </Modal>
</template>
