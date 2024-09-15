<script setup lang="ts">
import { computed } from 'vue'
import ModalRoute from './ModalRouteView'
import { useRoute } from 'vue-router'
import { ensureInjection } from './helpers'
import { modalRouteContextKey, useModalRoute } from './modalRoute'

const route = useRoute()
const ctx = ensureInjection(modalRouteContextKey, 'useModalRoute must be used inside a ModalRoute component')
const { isModalActive } = useModalRoute()

const componentsBeRendered = computed(
  () => ctx.queryRoutes
    .flatMap(modal => isModalActive(modal.name) ? [{ modalName: modal.name, component: modal.component }] : []),
)
const parent = computed(() => {
  return route.matched.at(-1)
})
</script>
<template>
  <ModalRoute
    :components="componentsBeRendered"
    :parent="parent"
    modal-type="query"
  />
</template>
