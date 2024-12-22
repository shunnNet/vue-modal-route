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
  <section class="border-b border-dashed pb-4 mb-4">
    <header class="mb-4 pb-2">
      <h3 class="text-xl font-bold text-neutral">
        <slot name="title">
          {{ title }}
        </slot>
      </h3>
      <p
        v-if="description"
        class="text-gray-500 mt-1 max-w-800px whitespace-pre-wrap"
        v-text="description"
      />
    </header>

    <slot />
  </section>
</template>

<style></style>
