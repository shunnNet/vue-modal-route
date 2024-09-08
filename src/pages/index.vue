<script setup lang="ts">
import { ElButton, ElDivider, ElLoading } from 'element-plus'
import ModalLink from '~/modal/ModalLink.vue'
import { ModalRouterView, useModalRoute } from '~/modal'

const { openModal, setupModal } = useModalRoute()
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

setupModal('ModalA', {
  props: {
    async handler(data) {
      const loading = ElLoading.service({ fullscreen: true })
      await sleep(2000)
      loading.close()

      return {
        message: 'Hello Modal A from index',
        ...data ?? {},
      }
    },
    mode: 'beforeVisible',
  },
  slots: {
    default: () => 'Injected default slot',
  },
})

setupModal('ModalB', {
  props: {
    message: 'Hello Modal B from index',
    onTrigger() {
      console.log('Triggered from index')
    },
  },
})
</script>
<template>
  <div>
    <div>
      <ElDivider />
      <ElButton
        type="primary"
        @click="openModal('ModalA', { message: 'Open By OpenModal function'})"
      >
        Open By OpenModal function
      </ElButton>
    </div>

    <ElDivider />
    <ModalLink
      :to="{ name: 'ModalA'}"
      :data="{ message: 'Open By ModalLink'}"
    >
      Open By ModalLink
    </ModalLink>
    <RouterView />
    <ModalRouterView />
  </div>
</template>
<style></style>
