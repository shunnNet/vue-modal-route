<script setup lang="ts">
import { ElButton,  ElFormItem, ElForm, ElLoading } from 'element-plus'
import {  ref, watch } from 'vue'
import {  useCurrentModal } from '@vmr/vue-modal-route'
import LayoutDialog from '~/components/LayoutDialog'
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  age: {
    type: Number,
    default: 0,
  },
})
const $emit = defineEmits([ 'update'])
const form = ref({
  name: '',
  age: 0,
})
const { close, closeThenReturn } = useCurrentModal()

watch(() => [props.name, props.age], (val) => {
  form.value.name = val[0] as string
  form.value.age = val[1] as number
}, { immediate: true })
const onSubmit = async () => {
  const loading = ElLoading.service({
    fullscreen: true,
    text: 'Submit user data...',
  })
  await sleep(1000)
  $emit('update', form.value)
  loading.close()
}
</script>
<template>
  <LayoutDialog
    title="Page Prepare ModalC"
  >
    <ElForm
      class="max-w-500px"
      label-width="100"
      @submit.prevent="onSubmit"
    >
      <ElFormItem label="Name">
        <ElInput v-model="form.name" />
      </ElFormItem>
      <ElFormItem label="Age">
        <ElInput v-model.number="form.age" />
      </ElFormItem>
      <ElFormItem>
        <ElButton
          native-type="submit"
          type="primary"
          icon="check"
        >
          Submit
        </ElButton>
      </ElFormItem>
    </ElForm>
    <div class="mt-4 flex font-bold text-emerald">
      <span class="w-40px">Tips:</span>
      Try to Refresh the page. Or copy/paste current url to other tab. <br>
      And you will first see the loading, then modal show after data loading complete.
    </div>
    <RouterView />
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
        @click="closeThenReturn('ModalC return value')"
      >
        Confirm
      </ElButton>
    </template>
  </LayoutDialog>
</template>
<style></style>
