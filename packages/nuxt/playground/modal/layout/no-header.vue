<script setup lang="ts">
import Modal from '@/components/Modal.vue'
import { useCurrentModal } from '@vmrh/core'

const { modelValue } = useCurrentModal()



</script>
<template>
  <Modal v-model="modelValue">
    <template #header>
      I am no header
    </template>
    <template #default>
      <slot />
    </template>
    <template #footer>
      <slot name="footer" />
    </template>
  </Modal>
</template>
<style></style>