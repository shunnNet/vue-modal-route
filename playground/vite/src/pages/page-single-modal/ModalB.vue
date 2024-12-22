<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import HighlightText from '~/components/HighlightText.vue'
import { ModalRouterView } from '@vmr/vue-modal-route'

const visible = defineModel({
  type: Boolean,
  default: false,
})
defineEmits(['return'])
defineProps({
  message: {
    type: String,
    default: '',
  },
})
const route = useRoute()
const router = useRouter()
console.log(router.getRoutes())
</script>
<template>
  <ElDialog
    v-model="visible"
    title="Page Single Modal B"
  >
    <p>Params.id: {{ route.params.id }}</p>
    <p>Close: no returnValue</p>
    <p>Confirm: 'ModalB return value'</p>
    <HighlightText :message="`Message from props: ${ message }`" />
    <ModalRouterView v-slot="{ Component }">
      <component :is="Component" />
    </ModalRouterView>
    <template #footer>
      <ElButton
        type="warning"
        icon="close"
        @click="visible = false"
      >
        Close
      </ElButton>
      <ElButton
        type="success"
        icon="check"
        @click="$emit('return', 'ModalB return value')"
      >
        Confirm
      </ElButton>
    </template>
  </ElDialog>
</template>
<style></style>
