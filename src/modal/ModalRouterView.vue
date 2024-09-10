<script setup lang="ts">
import { inject } from 'vue'
import ModalRoute from './ModalRoute'
import { matchedRouteKey } from 'vue-router'

const matchedRoute = inject(matchedRouteKey)

</script>
<template>
  <RouterView v-slot="{ Component }">
    <ModalRoute
      :components="[Component]"
      :parent="matchedRoute"
    />
  </RouterView>
</template>
