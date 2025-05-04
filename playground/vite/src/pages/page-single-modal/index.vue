<script setup lang="ts">
import PageTitle from '../../components/PageTitle.vue'
import { ElButton, ElDivider } from 'element-plus'
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import SingleModalSectionA from '~/components/SingleModalSectionA.vue'
import SingleModalSectionB from '~/components/SingleModalSectionB.vue'
import { ModalRouterView, ModalPathView } from '@vmrh/core'

const insertMessage = ref('Message from slot')

</script>
<template>
  <div>
    <PageTitle
      title="Page Single Modal"
      description="Open 1 modal a time"
    />
    <div class="grid gap-4">
      <SingleModalSectionA />
      <SingleModalSectionB />
    </div>

    <ElDivider />
    <RouterView />

    <!-- <ModalRouterView test="single">
      <template #ModalPageSingleA-footer>
        <span>{{ insertMessage }}</span>
      </template>
      <template #ModalPageSingleA-header>
        <span> header slot inserted from parent </span>
      </template>
      <template #ModalTest-custom="{ custom }">
        <div>custom message: {{ custom }}</div>
      </template>
    </ModalRouterView> -->
    <ModalPathView>
      <template #ModalTest-custom="{ custom }">
        <div>custom message: {{ custom }}</div>
      </template>
    </ModalPathView>
  </div>
</template>
<style></style>
