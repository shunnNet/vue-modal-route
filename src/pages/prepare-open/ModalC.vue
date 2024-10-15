<script setup lang="ts">
import { ElButton, ElDialog, ElFormItem, ElForm, ElLoading } from 'element-plus'
import { onMounted, ref, watch } from 'vue'
import { sleep } from '~/modal'

const visible = defineModel({
  type: Boolean,
  default: false,
})
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
const $emit = defineEmits(['return', 'update'])
const form = ref({
  name: '',
  age: 0,
})
onMounted(() => {
  form.value.name = props.name
  form.value.age = props.age
})
watch(() => props.name, (val) => {
  form.value.name = val
})
watch(() => props.age, (val) => {
  form.value.age = val
})
const onSubmit = async () => {
  const loading = ElLoading.service({
    fullscreen: true,
    text: 'Submit user data...',
  })
  await sleep(1000)
  $emit('update', form.value)
  loading.close()
  visible.value = false
}
</script>
<template>
  <ElDialog
    v-model="visible"
    title="Page Prepare ModalC"
  >
    <ElForm
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
    <RouterView name="modal-default" />
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
        @click="$emit('return', 'ModalC return value')"
      >
        Confirm
      </ElButton>
    </template>
  </ElDialog>
</template>
<style></style>
