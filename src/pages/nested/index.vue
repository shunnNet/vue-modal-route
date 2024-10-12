<script setup lang="ts">
import { useModalRoute, ModalPathView, useModal } from '~/modal'
import PageTitle from '~/components/PageTitle.vue'

const { openModal } = useModalRoute()

const { open } = useModal('ModalNestedA')
const onClickOpenNestedB = async () => {
  const result = await openModal('ModalNestedB')
  console.log(result)
}
</script>
<template>
  <div>
    <PageTitle
      title="Nested OpenModal"
      description="open nested modal"
    />
    <ElButton
      type="primary"
      @click="onClickOpenNestedB"
    >
      Open ModalNestedB (modalA/modalB)
    </ElButton>
    <ModalPathView />
  </div>
</template>
<style></style>
