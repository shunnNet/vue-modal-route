<script setup lang="ts">
import { ModalHashView, ModalQueryView, useModalRoute, useModal } from '~/modal'
import { matchedRouteKey } from 'vue-router'
import { inject } from 'vue'
import { ElButton } from 'element-plus'

const matchedRoute = inject(matchedRouteKey, null)
console.log('app', matchedRoute?.value)

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
]

const { openModal } = useModalRoute()
const onOpenHashModal = () => {
  openModal('ModalHashA').then((v) => {
    console.log('ModalHashA return', v)
  })
}
const onOpenQueryModal = () => {
  openModal('ModalQueryA').then((v) => {
    console.log('ModalQueryA return', v)
  })
}
// useModal()
</script>
<template>
  <div class="grid grid-cols-[200px_1fr] grid-auto-flow-col min-h-100vh">
    <nav class="grid gap-2 p-4 border-r grid-auto-rows-[max-content]">
      <RouterLink
        v-for="navItem in navs"
        :key="navItem.name"
        class="p-2 hover:bg-gray-800 hover:text-white rounded-xl"
        :to="{ name: navItem.name }"
      >
        {{ navItem.title }}
      </RouterLink>
      <ElButton @click="onOpenHashModal">
        OpenHashModal
      </ElButton>
      <ElButton @click="onOpenQueryModal">
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
