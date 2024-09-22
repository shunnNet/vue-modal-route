<script setup lang="ts">
import { ElButton, ElDivider, ElLoading } from 'element-plus'
import ModalLink from '~/modal/ModalLink.vue'
import { ModalPathView, useModalRoute, useModalRejection } from '~/modal'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const { openModal, setupModal } = useModalRoute()
const rejectModal = useModalRejection()

const router = useRouter()
const route = useRoute()
onMounted(() => {
  console.log(route.query)
  Object.keys(route.query).forEach((key) => {
    console.log(key, route.query[key])
  })
})
// console.log(router.currentRoute.value)
// console.log(router.getRoutes())
const messageRef = ref('From ref message')
const { unlock, returnValue } = setupModal('ModalA', {
  props: {
    handler(data) {
      return {
        message: messageRef,
        ...data ?? {},
      }
    },

  },
  // manual: true,
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
const openAndGetReturn = async () => {
  const data = await openModal('ModalA', { message: 'Open By OpenModal function' })
  console.log('ReturnValue:', data)
}
setTimeout(() => {
  // unlock()
}, 2000)
</script>
<template>
  <div>
    <div>
      <div>
        ReturnValue: {{ returnValue }}
      </div>

      <ElDivider />
      <ElButton
        type="primary"
        @click="openAndGetReturn"
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
