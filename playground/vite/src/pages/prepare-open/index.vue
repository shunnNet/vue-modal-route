<script setup lang="ts">
import PageTitle from '~/components/PageTitle.vue'
import SingleModalSectionC from '~/components/SingleModalSectionC.vue'
import { ModalRouterView } from '@vmrh/core'

</script>
<template>
  <PageTitle
    title="Prepare then open"
    description="A situation that API data is required before opening the modal."
  />

  <SingleModalSectionC />
  <ModalRouterView />
</template>
<style></style>
