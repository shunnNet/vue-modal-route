<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useModalRoute } from '~/modal'
import { ModalPathView, ModalHashView } from '~/modal'

const { openModal } = useModalRoute()

</script>
<template>
  <div>
    <h1>test page</h1>
    <ElButton
      type="success"
      @click="openModal('hash-modal-a')"
    >
      open hash modal a
    </ElButton>
    <ElButton
      type="warning"
      @click="openModal('ModalE')"
    >
      open Path Modal E
    </ElButton>
  </div>
  <ModalHashView />
  <ModalPathView />
</template>
<style></style>
