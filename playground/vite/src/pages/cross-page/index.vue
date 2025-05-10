<script setup lang="ts">
import { useModalRoute } from '@vmrh/core'
import PageTitle from '~/components/PageTitle.vue'
import PageSection from '~/components/PageSection.vue'

const { openModal } = useModalRoute()

</script>
<template>
  <div>
    <PageTitle
      title="Cross Page OpenModal"
      description="open modal from/in another page"
    />
    <PageSection
      title="CrossPageA"
      description="open nested modal in another page, then check if the history is correct."
    >
      <ElButton
        type="success"
        @click="openModal('ModalCrossPageA')"
      >
        Open ModalCrossPageA
      </ElButton>
    </PageSection>
    <div class="grid gap-3">
      <div>
        <ElButton
          type="primary"
          @click="openModal('modal-a')"
        >
          Open ModalPageSingleA in "Single Modal"
        </ElButton>
      </div>
      <div>
        <ElButton
          type="primary"
          @click="openModal('ModalNestedB')"
        >
          Open ModalNestedB in "Nested"
        </ElButton>
      </div>
    </div>
    <ModalRouterView />
  </div>
</template>
<style></style>
