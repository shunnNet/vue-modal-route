<script setup lang="ts">
import { useModalRoute, ModalRouterView } from '@vmrh/core'

definePageMeta({
  name: "hello",
})

const { openModal, closeModal } = useModalRoute()
</script>

<template>
  <div>
    <h1>Index</h1>
    <button @click="openModal('index-user', { data: { message: 'Hello' } })">Open Modal</button>
    <!-- 
    hydration mismatch when no name is provided
    <NuxtPage /> 
    -->
    <!-- <NuxtPage  /> -->
    <ModalRouterView />

    <!-- <button @click="openModal('index-user.modal')">Open Modal</button>
    <button @click="openModal('login.modal')">Open Login Modal</button> -->
  </div>
</template>


