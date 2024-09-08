<script setup lang="ts">
import { ElButton, ElDivider, ElLoading } from 'element-plus'
import ModalLink from '~/modal/ModalLink.vue'
import { useOpenModal, ModalRouterView, defineModalDatas } from '~/modal'

const { openModal } = useOpenModal()
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const modalData = defineModalDatas({
  ModalA: {
    async getModalData(data) {
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
  ModalB: {
    async getModalData(data) {
      console.log(data)
      await sleep(2000)
      return {
        message: 'Hello Modal B from index',
      }
    },
    mode: 'afterVisible',
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
    <ModalRouterView :modal-data="modalData" />
  </div>
</template>
<style></style>
