<script setup lang="ts">
import { useModalRoute, ModalPathView } from '~/modal'
import PageTitle from '~/components/PageTitle.vue'

const { openModal } = useModalRoute()

</script>
<template>
  <div>
    <PageTitle
      title="Nested OpenModal"
      description="open nested modal"
    />
    <ElButton
      type="primary"
      @click="openModal('ModalNestedB')"
    >
      Open ModalNestedB (modalA/modalB)
    </ElButton>
    <ModalPathView />
  </div>
</template>
<style></style>
