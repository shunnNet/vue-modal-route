<script setup lang="ts">
import { ElButton, ElDivider, ElLoading } from 'element-plus'
import ModalLink from '~/modal/ModalLink.vue'
import { ModalPathView, useModalRoute, useModalRejection } from '~/modal'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'

const { openModal, setupModal } = useModalRoute()
const rejectModal = useModalRejection()

const router = useRouter()
// console.log(router.currentRoute.value)
// console.log(router.getRoutes())
const messageRef = ref('From ref message')
const { unlock } = setupModal('ModalA', {
  props: {
    handler(data) {
      return {
        message: messageRef,
        ...data ?? {},
      }
    },

  },
  manual: true,
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
const pushSelf = () => {
  router.push('#')
}
setTimeout(() => {
  unlock()
}, 2000)
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
      <ElButton
        type="primary"
        @click="openModal('ModalA', { })"
      >
        Open By OpenModal function (no data)
      </ElButton>
    </div>

    <ElDivider />
    <ModalLink
      name="ModalA"
      :data="{ message: 'Open By ModalLink'}"
    >
      Open By ModalLink
    </ModalLink>
    <ElButton
      type="success"
      @click="openModal('hash-modal-a', null)"
    >
      openModal hash-modal-a
    </ElButton>
    <ElButton
      type="success"
      @click="pushSelf()"
    >
      Push
    </ElButton>
    <RouterView />
    <ModalPathView />
  </div>
</template>
<style></style>
