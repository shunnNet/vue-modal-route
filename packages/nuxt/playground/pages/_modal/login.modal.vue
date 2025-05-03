<script setup lang="ts">
import { useModalRoute } from '@vmr/core'
const visible = defineModel<boolean>()

const { openModal } = useModalRoute()
</script>
<template>
  <Modal v-model="visible">
    <template #header>
      <h1>Login</h1>
    </template>
    <template #body>
      <p>Login</p>
    </template>
    <template #footer>
      <button @click="openModal('index-user.modal')">Open User Modal</button>
    </template>
  </Modal>
</template>
<style></style>
