<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModalC from './pages/ModalC.vue'
import ModalHashLink from './modal/ModalHashLink.vue'
import ModalHashView from './modal/ModalHashView.vue'
import ModalLink from './modal/ModalLink.vue'

const route = useRoute()
const showModalC = computed(() => route.hash.slice(1) === 'modal-c')
// const router = useRouter()

// onMounted(() => {
//   console.log(router)
// })

</script>
<template>
  <div>
    <nav class="nav">
      <ModalLink :to="{ name: 'ModalA'}">
        Modal A (Will be rejected)
      </ModalLink>
      <ModalLink
        :to="{ name: 'ModalA'}"
        :data="{ message: 'Hello from link'}"
      >
        Modal A with Data
      </ModalLink>
      <ModalLink :to="{ name: 'ModalB'}">
        Modal B
      </ModalLink>
    </nav>
    <!-- <ModalHashLink hash-value="modalc">
      Modal C
    </ModalHashLink> -->
  </div>
  <!-- <ModalHashView /> -->

  <RouterView />
</template>
<style>
.nav {
  display: grid;
  grid-auto-flow: column;
  gap: 16px;
  grid-auto-columns: max-content;
}
</style>
