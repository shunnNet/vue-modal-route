<script setup lang="ts">
import PageSection from '~/components/PageSection.vue'
import HighlightText from '~/components/HighlightText.vue'
import { ElButton, ElMessage } from 'element-plus'
import { computed, h, ref } from 'vue'
import {
  useModalRoute,
  useModalReturnValue,
  setupModal,
  useModalActive,
} from '@vmr/core'
import { useRouter } from 'vue-router'
import { ModalA } from '~/modals'

const router = useRouter()

const { openModal, closeModal } = useModalRoute()

const onAClick = async () => {
  const returnValue = await openModal('modal-a')
  ElMessage.success(`ModalPageSingleA return value: "${returnValue}"`)
}

const modalProps = ref({
  message: 'default message',
  onMessage($event: string) {
    ElMessage.success(`modal emit message "${$event}"`)
  },
})

const {
  open,
  close,
  returnValue,
  isActive: isModalAActive,
} = ModalA.setup({
  props: (data) => {
    return computed(() => {
      console.log(data);
      return {
        ...modalProps.value,
        ...(data?.message ? { message: data?.message } : {}),
      }
    })
  },
  slots: {
    footer: () => (
      h('span', 'This Slot passed from useModal. Should override the slot passed from template')
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
const onCloseWithFailCase = async (name: string) => {
  try {
    await closeModal(name)
  }
  catch (e) {
    ElMessage.error((e as Error).message)
  }
}

const ModalAReturn = useModalReturnValue<any>('modal-a')
const ModalAActive = useModalActive('modal-a')

const { open: _openModalTest } = setupModal('ModalTest', {
  props: {
    message: 'bar',
  },
  slots: {
    // custom: ({ custom }: { custom: string }) => h(HighlightText, { message: `(${custom}) This Slot passed from useModal. Should override the slot passed from template` }),
    // () => h('div', 'This Slot passed from useModal. Should override the slot passed from template'),
  },

})
const openModalTest = () => {
  _openModalTest({
    data: {
      message: 'data from `openModal`',
    },
    params: {
      foo: 'bar',
    },
  }).then((value) => {

    ElMessage.success(`ModalTest return value: "${value}"`)
  })
}
const openModalTestChild = () => {
  openModal('ModalTestChild', {
    params: {
      foo: 'bar',
    },
  }).then((value) => {

    ElMessage.success(`ModalTest return value: "${value}"`)
  })
}
</script>
<template>
  <PageSection
    title="ModalA"
    :description="`This section has almost all abilities vue-modal-route has, the 'ModalA' can be enter directly by url.\nOpen it then refresh, or copy the url and open it in new tab.\n(Only modal in 'direct' mode can do this)`"
  >
    <Teleport
      v-if="isModalAActive"
      to="body"
    >
      <div class="fixed top-20px left-20px z-100000">
        <ElButton
          type="warning"
          @click="close()"
        >
          Close PageSingleModalA by "close" from "useModal"
        </ElButton>
      </div>
    </Teleport>
    <ElButton
      type="success"
      @click="openModalTest"
    >
      Open ModalTest
    </ElButton>
    <ElButton
      type="success"
      @click="openModalTestChild"
    >
      Open openModalTestChild
    </ElButton>

    <ElButton
      type="primary"
      @click="onAClick"
    >
      Open (no data)
    </ElButton>
    <ElButton
      type="primary"
      @click="open( { data: { message: 'data from `open` method' } })"
    >
      Open (with data)
    </ElButton>

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
    </ul>
    <div class="mt-3 grid gap-3">
      <div>
        <ElButton
          type="danger"
          @click="router.push('/modal-a')"
        >
          Open By "router.push" (Not allow)
        </ElButton>
      </div>
      <div>
        <ElButton
          type="danger"
          @click="onOpenNotExistModal"
        >
          Open With not exist modal name
        </ElButton>
      </div>
      <div>
        <ElButton
          type="danger"
          @click="onCloseWithFailCase('NotExistModal')"
        >
          Close Modal which is not exist
        </ElButton>
      </div>
      <div>
        <ElButton
          type="danger"
          @click="onCloseWithFailCase('ModalPageSingleA')"
        >
          Close Modal which is not opened
        </ElButton>
      </div>
    </div>
  </PageSection>
</template>
<style></style>
