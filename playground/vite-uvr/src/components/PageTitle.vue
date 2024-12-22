<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>
<template>
  <header class="mb-4 pb-2 border-b">
    <h2 class="text-2xl font-bold text-neutral">
      <slot>
        {{ title }}
      </slot>
    </h2>
    <p
      v-if="description"
      class="text-gray-500 mt-1"
      v-text="description"
    />
  </header>
</template>

<style></style>
