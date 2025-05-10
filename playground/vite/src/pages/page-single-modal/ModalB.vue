<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useRoute } from 'vue-router'
import HighlightText from '~/components/HighlightText.vue'
import { useCurrentModal } from '@vmrh/core'
import LayoutDialog from '~/components/LayoutDialog'


defineProps({
  message: {
    type: String,
    default: '',
  },
})
const route = useRoute()

const { closeThenReturn, close } = useCurrentModal()
</script>
<template>
  <LayoutDialog
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
        @click="close()"
      >
        Close
      </ElButton>
      <ElButton
        type="success"
        icon="check"
        @click="closeThenReturn('ModalB return value')"
      >
        Confirm
      </ElButton>
    </template>
  </LayoutDialog>
</template>
<style></style>
