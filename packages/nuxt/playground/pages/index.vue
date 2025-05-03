<script setup lang="ts">
import { useModalRoute, ModalPathView } from '@vmr/core'
definePageMeta({
  name: "hello",
})

const { openModal, closeModal } = useModalRoute()
</script>

<template>
  <div>
    <h1>Index</h1>
    <button @click="openModal('index-user.modal')">Open Modal</button>
    <button @click="openModal('login.modal')">Open Login Modal</button>
    <ModalPathView />
  </div>
</template>


