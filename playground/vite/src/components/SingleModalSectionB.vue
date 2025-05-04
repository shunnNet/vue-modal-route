<script setup lang="ts">
import PageSection from '~/components/PageSection.vue'
import { ElButton } from 'element-plus'
import {
  setupModal,
  useModalRoute,
} from '@vmrh/core'
import { ModalB } from '~/modals'

const { openModal } = useModalRoute()

const { open: openModalB } = ModalB.setup({
  props: {
    message: 'message from props should override the message from open method',
  },
})

</script>
<template>
  <PageSection title="ModalB">
    <p>Open With `modal-b/child?query1=query1#hash` params { id: 'ModalB ID'}</p>
    <ElButton
      type="primary"
      @click="openModalB({
        data: { message: 'data from `open` method' },
        // query: { query1: 'query1' },
        hash: '#hash',
        params: { id: 'ModalB-ID'}
      })"
    >
      Open
    </ElButton>
  </PageSection>
</template>
<style></style>
