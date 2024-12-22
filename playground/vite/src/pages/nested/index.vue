<script setup lang="ts">
import { useModalRoute, ModalPathView } from '@vmr/vue-modal-route'
import PageTitle from '~/components/PageTitle.vue'
import { ref } from 'vue'

const { openModal } = useModalRoute()
console.log('page nested setup')

const nestedResult = ref({})

const onClickOpenNestedB = async () => {
  const result = await openModal('ModalNestedB', {
    data: [
      ['ModalNestedA', { message: 'data from `open` method to A' }],
      ['ModalNestedB', { message: 'data from `open` method to B' }],
      ['ModalNestedC', { message: 'data from `open` method to C' }],
    ],
  })
  nestedResult.value = result
}
const onClickOpenNestedBChild = async () => {
  const result = await openModal('ModalNestedBChild')
  nestedResult.value = result
}

</script>
<template>
  <div>
    <PageTitle
      title="Nested OpenModal"
      description="open nested modal"
    />
    <div class="grid gap-4">
      <div>
        <ElButton
          type="primary"
          @click="onClickOpenNestedB"
        >
          Open ModalNestedB (modalA/modalB) with data
        </ElButton>
      </div>
      <div>
        <ElButton
          type="primary"
          @click="onClickOpenNestedBChild"
        >
          Open modalA/modalB/child-path
        </ElButton>
      </div>

      <div>
        <pre
          class="bg-gray/30 rounded-lg text-white p-2"
          v-text="nestedResult"
        />
      </div>
      <div class="my-4 font-italic text-14px">
        There is a issue. To reproduce:
        <ol class="list-decimal pl-4 block my-2">
          <li>Click "Open ModalNestedB"</li>
          <li>Click "Close" in "ModalNestedB"</li>
          <li>Click "Open ModalB" in "ModalNestedA"</li>
          <li>Click "Confirm" in "ModalNestedB"</li>
          <li>Click "Confirm" in "ModalNestedA"</li>
        </ol>
        The returnValue of "ModalNestedB" will be "null" which is the first result of "ModalNestedB".
      </div>
    </div>
    <ModalPathView />
  </div>
</template>
<style></style>
