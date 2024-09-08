<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useModalRoute } from '~/modal/modalRouteContext'

const { openGlobalModal } = useModalRoute()

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
