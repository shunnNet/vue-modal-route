<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus'
import { useCurrentModal, useModalRoute } from '@vmrh/core'
import HighlightText from '~/components/HighlightText.vue'
import LayoutDialog from '~/components/LayoutDialog'

defineProps({
  message: {
    type: String,
    default: '',
  },
})
const { openModal, closeModal } = useModalRoute()
const { close, closeThenReturn } = useCurrentModal()
const onOpenFailedCase = async (name: string) => {
  try {
    await openModal(name)
  }
  catch (e) {
    console.error(e)
    ElMessage.error((e as Error).message)
  }
}

</script>
<template>
  <LayoutDialog
    title="Nested Modal B"
    class="max-w-400px !w-full"
  >
    <div>
      <HighlightText
        v-if="message"
        :message="message"
      />
    </div>
    <RouterLink
      :to="{ name: 'ModalNestedBChild'}"
      class="text-blue-5 hover:text-red-5"
    >
      Go to Child
    </RouterLink>

    <div class="my-4">
      <!-- <ModalRouterView /> -->
      <ModalRouterView >
        <template #default="{ Component }">
          <Transition name="fade" mode="out-in" appear>
            <component :is="Component" />
          </Transition>
        </template>
      </ModalRouterView>
    </div>

    <div class="grid gap-4 max-w-200px">
      <ElButton
        class="!ml-0"
        type="danger"
        @click="onOpenFailedCase('ModalNestedA')"
      >
        Open Parent ModalA
      </ElButton>
      <ElButton
        class="!ml-0"
        type="danger"
        @click="onOpenFailedCase('ModalNestedB')"
      >
        Open Self (Not allowed)
      </ElButton>
      <ElButton
        class="!ml-0"
        type="danger"
        @click="onOpenFailedCase('ModalNestedBChild')"
      >
        Go to Child by OpenModal (Not allowed)
      </ElButton>
      <ElButton
        class="!ml-0"
        type="primary"
        @click="closeModal('ModalNestedA')"
      >
        Close Parent ModalA
      </ElButton>
      <ElButton
        class="!ml-0"
        type="warning"
        icon="close"
        @click="close()"
      >
        Close
      </ElButton>
      <ElButton
        class="!ml-0"
        type="success"
        icon="check"
        @click="closeThenReturn('ModalB return value')"
      >
        Close (with Return Value)
      </ElButton>
      <ElButton
        class="!ml-0"
        type="info"
        icon="Message"
        @click="openModal('ModalNestedBChildTest')"
      >
        Open Child ModalTest
      </ElButton>
    </div>

    <template #footer />
  </LayoutDialog>
</template>
<style>

</style>
