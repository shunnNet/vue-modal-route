<script setup lang="ts">
import { useCurrentModal, useModalRoute } from '@vmrh/core'
definePageMeta({
  // name: "hello",
  // direct: true,
  // injectFromComponent: true,
})
const {  closeThenReturn } = useCurrentModal()
defineProps({
  message: {
    type: String,
    default: '',
  },
})

</script>

<template>
  <ModalLayout layout="no-header">
    <template #header>
      <h1>Login Modal23</h1>
    </template>
    <template >
      <p>{{ message }}</p>
    </template>
    <template #footer>
      <button @click="closeThenReturn(null)">Close</button>
      <!-- <button @click="openModal('login')">Open Login Modal</button> -->
    </template>
  </ModalLayout>
</template>
