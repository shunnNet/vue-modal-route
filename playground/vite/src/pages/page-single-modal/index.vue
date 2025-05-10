<script setup lang="ts">
import PageTitle from '../../components/PageTitle.vue'
import { ElDivider } from 'element-plus'
import SingleModalSectionA from '~/components/SingleModalSectionA.vue'
import SingleModalSectionB from '~/components/SingleModalSectionB.vue'
import { ModalRouterView } from '@vmrh/core'


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
    <ModalRouterView>
      <template #ModalTest-custom="{ custom }">
        <div>custom message: {{ custom }}</div>
      </template>
    </ModalRouterView>
  </div>
</template>
<style></style>
