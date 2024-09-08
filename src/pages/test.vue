<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useModalRouteContext } from '~/modal/modalRouteContext'

const { openGlobalModal } = useModalRouteContext()

</script>
<template>
  <div>
    <h1>test page</h1>
    <ElButton
      type="success"
      @click="openGlobalModal('hash-modal-a')"
    >
      openGlobalModal
    </ElButton>
  </div>
</template>
<style></style>
