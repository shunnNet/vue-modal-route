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
</script>
<template>
  <div>
    <nav class="nav">
      <RouterLink :to="{ name: 'Index' }">
        Index
      </RouterLink>

      <ModalLink :to="{ name: 'ModalA' }">
        Modal A (Will be rejected)
      </ModalLink>
      <ModalLink
        :to="{ name: 'ModalA'}"
        :data="{ message: 'Hello from link' }"
      >
        Modal A with Data
      </ModalLink>
      <ModalLink :to="{ name: 'ModalB' }">
        Modal B
      </ModalLink>
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
