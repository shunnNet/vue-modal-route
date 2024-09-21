<script setup lang="ts">
import { useModalRoute } from './modal'
import ModalHashView from './modal/ModalHashView.vue'
import ModalLink from './modal/ModalLink.vue'

const { setupModal } = useModalRoute()
setupModal('hash-modal-a', {
  props: {
    handler(data) {
      console.log('hash-modal-a', data)
      return {
        message: 'Hello from hash modal a',
        ...data ?? {},
      }
    },
  },
})
const { openModal } = useModalRoute()
</script>
<template>
  <div>
    <nav class="nav">
      <RouterLink :to="{ name: 'Index' }">
        Index
      </RouterLink>
      <RouterLink :to="{ name: 'Test' }">
        Test
      </RouterLink>

      <ModalLink :name="'ModalA'">
        Modal A (Will be rejected)
      </ModalLink>
      <ModalLink
        :name="'ModalA'"
        :data="{ message: 'Hello from link' }"
      >
        Modal A with Data
      </ModalLink>
      <ModalLink :name="'ModalB'">
        Modal B
      </ModalLink>
      <ElButton @click="openModal('query-modal-a', {})">
        Query Modal A
      </ElButton>
    </nav>
  </div>

  <RouterView />
  <ModalHashView />
</template>
<style>
.nav {
  display: grid;
  grid-auto-flow: column;
  gap: 16px;
  grid-auto-columns: max-content;
}
</style>
