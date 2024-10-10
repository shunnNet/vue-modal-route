<script setup lang="ts">
import { useModalRoute } from '~/modal'
import PageTitle from '~/components/PageTitle.vue'

const { openModal } = useModalRoute()

</script>
<template>
  <div>
    <PageTitle
      title="Cross Page OpenModal"
      description="open modal from/in another page"
    />
    <ElButton
      type="primary"
      @click="openModal('ModalPageSingleA')"
    >
      Open ModalPageSingleA in "Single Modal"
    </ElButton>
    <ElButton
      type="primary"
      @click="openModal('ModalNestedB')"
    >
      Open ModalNestedB in "Nested"
    </ElButton>
  </div>
</template>
<style></style>
