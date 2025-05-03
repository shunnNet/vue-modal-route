<script setup lang="ts">
import PageTitle from '../components/PageTitle.vue'
import { ElDivider } from 'element-plus'
import { ref } from 'vue'
import SingleModalSectionA from '~/components/SingleModalSectionA.vue'
// import SingleModalSectionB from '~/components/SingleModalSectionB.vue'
import { ModalPathView } from '@vmr/core'

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
    </div>

    <ElDivider />
    <RouterView />

    <ModalPathView>
      <template #ModalPageSingleA-footer>
        <span>{{ insertMessage }}</span>
      </template>
      <template #ModalPageSingleA-header>
        <span> header slot inserted from parent </span>
      </template>
    </ModalPathView>
  </div>
</template>
