<script setup lang="ts">
import PageTitle from '~/components/PageTitle.vue'
import SingleModalSectionC from '~/components/SingleModalSectionC.vue'
import { ModalPathView } from '@vmrh/core'

</script>
<template>
  <PageTitle
    title="Prepare then open"
    description="A situation that API data is required before opening the modal."
  />

  <SingleModalSectionC />
  <ModalPathView />
</template>
<style></style>
