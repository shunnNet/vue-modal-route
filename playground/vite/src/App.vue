<script setup lang="ts">
import { ModalHashView, ModalQueryView, useModalRoute, setupModal } from '@vmr/modal-route'
import { ElButton } from 'element-plus'
import { QueryModalA } from './modals'

const navs = [
  {
    name: 'PageSingleModal',
    title: 'Single Modal',
  },
  {
    name: 'PageCrossPage',
    title: 'Cross Page',
  },
  {
    name: 'PageNestedModal',
    title: 'Nested',
  },
  {
    name: 'PagePrepare',
    title: 'API Required',
  },
]

const { openModal } = useModalRoute()
const onOpenHashModal = () => {
  openModal('ModalHashA', {
    // Hash should be ignore
    hash: '#hash',
  }).then((v) => {
    console.log('ModalHashA return', v)
  })
}
const { open: openQueryModalA } = QueryModalA.use()

const onOpenQueryModal = () => {
  openQueryModalA({
    // Query should be append
    query: { additionQuery: 'query1' },
    // Hash should be ignore
    hash: '#hash',
  }).then((v) => {
    console.log('ModalQueryA return', v)
  })
}

QueryModalA.setup({
  props: {
    message: 'Message from App.vue to ModalQueryA',
  },
})

// useModal('ModalHashA', {
//   props: {
//     message: 'Message from App.vue to ModalHashA',
//   },
// })

console.log('app setup')
// useModal()
</script>
<template>
  <div>
    <nav class="flex flex-wrap items-center gap-2 p-4 border-b grid-auto-rows-[max-content]">
      <RouterLink
        v-for="navItem in navs"
        :key="navItem.name"
        class="p-2 hover:bg-gray-800 hover:text-white rounded-xl text-center"
        :to="{ name: navItem.name }"
      >
        {{ navItem.title }}
      </RouterLink>
      <ElButton
        type="primary"
        @click="onOpenHashModal"
      >
        OpenHashModal
      </ElButton>
      <ElButton
        type="primary"
        @click="onOpenQueryModal"
      >
        OpenQueryModal
      </ElButton>
    </nav>
    <div class="p-4">
      <RouterView />
    </div>
  </div>
  <ModalHashView />
  <ModalQueryView />
</template>
<style>
:root {
  color-scheme: dark;
}
body {
  color: #a3a3a3;
}

</style>
