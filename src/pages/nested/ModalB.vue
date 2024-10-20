<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus'
import { ModalRouterView, useModalRoute } from '~/modal'
import HighlightText from '~/components/HighlightText.vue'

const visible = defineModel({
  type: Boolean,
  default: false,
})
defineProps({
  message: {
    type: String,
    default: '',
  },
})
defineEmits(['return', 'message'])
const { openModal, closeModal } = useModalRoute()
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
  <ElDrawer
    v-model="visible"
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
      <ModalRouterView />
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
        @click="visible = false"
      >
        Close
      </ElButton>
      <ElButton
        class="!ml-0"
        type="success"
        icon="check"
        @click="$emit('return', 'ModalB return value')"
      >
        Close (with Return Value)
      </ElButton>
    </div>

    <template #footer />
  </ElDrawer>
</template>
<style></style>
