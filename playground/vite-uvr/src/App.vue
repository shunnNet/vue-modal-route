<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
<template>
  <nav class="flex gap-3 items-center p-4">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/single">Single</RouterLink>
  </nav>
  <main class="p-4">
    <RouterView />
  </main>
</template>
