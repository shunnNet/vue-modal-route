<script setup lang="ts">
import { useCurrentModal, useModalRoute, ModalLayout } from '@vmrh/core'
definePageMeta({
  // name: "hello",
  direct: true,
  injectFromComponent: true,
})

defineProps({
  message: {
    type: String,
    default: '',
  },
})
const { modelValue, closeThenReturn } = useCurrentModal()

const { openModal } = useModalRoute()
</script>

<template>
  <ModalLayout layout="no-header">
    <template #header>
      <h1>User Modal</h1>
    </template>
    <template >
      <p>{{ message }}</p>
    </template>
    <template #footer>
      <button @click="closeThenReturn(null)">Close</button>
      <button @click="openModal('login')">Open Login Modal</button>
      <button @click="openModal('alert')">Open Alert Modal</button>
    </template>
  </ModalLayout>
</template>
