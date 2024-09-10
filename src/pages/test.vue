<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useModalRoute } from '~/modal/modalRouteContext'
import { ModalQueryView } from '~/modal'

const { openModal } = useModalRoute()

</script>
<template>
  <div>
    <h1>test page</h1>
    <ElButton
      type="success"
      @click="openModal('hash-modal-a', null)"
    >
      openModal
    </ElButton>
  </div>
  <ModalQueryView />
</template>
<style></style>
