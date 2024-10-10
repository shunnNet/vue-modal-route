<script setup lang="ts">
import PageTitle from '../../components/PageTitle.vue'
import { ElButton, ElDivider, ElMessage } from 'element-plus'
import { h, ref } from 'vue'
import HighlightText from '~/components/HighlightText.vue'
import {
  useModalRoute,
  ModalPathView,
  useModalReturnValue,
  useModal,
  useModalActive,
} from '~/modal'

const { openModal } = useModalRoute()
const onAClick = async () => {
  const returnValue = await openModal('ModalPageSingleA')
  console.log('returnValue', returnValue)
}

const modalMessage = ref('')
const {
  open,
  returnValue,
  isActive: isModalAActive,
} = useModal('ModalPageSingleA', {
  props: {
    onMessage: (message: string) => {
      console.log('onMessage', message)
      modalMessage.value = message
    },
  },
  slots: {
    footer: () => (
      h('span', 'overwrite footer')
    ),
  },
})

const onOpenNotExistModal = async () => {
  try {
    await openModal('"NotExistModal"')
  }
  catch (e) {
    ElMessage.error((e as Error).message)
  }
}

const ModalAReturn = useModalReturnValue<any>('ModalPageSingleA')
const ModalAActive = useModalActive('ModalPageSingleA')

const insertMessage = ref('Message from slot')
setTimeout(() => {
  insertMessage.value = 'Message from slot after 5s'
}, 5000)
</script>
<template>
  <div>
    <PageTitle
      title="Page Single Modal"
      description="Open 1 modal a time"
    />
    <div class="grid gap-4">
      <div>
        <ElButton
          type="primary"
          @click="onAClick"
        >
          Open ModalPageSingleA
        </ElButton>
        <ElButton
          type="primary"
          @click="open( { data: { message: 'data from `open` method' } })"
        >
          Open With data.message
        </ElButton>

        <ElButton
          type="danger"
          @click="onOpenNotExistModal"
        >
          Open With not exist modal name
        </ElButton>
      </div>
      <div>
        <ElButton
          type="primary"
          @click="openModal( 'ModalPageSingleBChild',{
            data: { message: 'data from `open` method' },
            query: { query1: 'query1' },
            hash: '#hash',
            params: { id: 'ModalB-ID'}
          })"
        >
          Open With `modal-b/child?query1=query1#hash` params { id: 'ModalB ID'}
        </ElButton>
      </div>

      <ul class="mt-2 list-disc pl-4 grid gap-2">
        <li>
          ReturnValue: <HighlightText :message="returnValue" />
        </li>
        <li>
          ReturnValue(composable): <HighlightText :message="ModalAReturn" />
        </li>
        <li>
          ModalAActive: {{ isModalAActive }}
        </li>
        <li>
          ModalAActive(composable): {{ ModalAActive }}
        </li>
        <li>
          Message from ModalA: <HighlightText :message="modalMessage" />
        </li>
      </ul>
    </div>
    <ElDivider />

    <ModalPathView>
      <template #ModalPageSingleA-footer>
        <span>{{ insertMessage }}</span>
      </template>
    </ModalPathView>
  </div>
</template>
<style></style>
