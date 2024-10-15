<script setup lang="ts">
import { useModal } from '~/modal'
import PageSection from './PageSection.vue'
import { ElButton, ElLoading } from 'element-plus'
import { computed, onMounted, ref } from 'vue'

const userData = ref({
  name: '',
  age: 0,
})

const fetchUserData = async () => {
  const loading = ElLoading.service({ fullscreen: true, text: 'Fetch user...' })
  await new Promise(resolve => setTimeout(resolve, 2000))
  userData.value = {
    name: 'Jane Doe',
    age: 25,
  }
  loading.close()
}

const modalProps = computed(() => {
  return {
    ...userData.value,
    onUpdate: (payload: any) => {
      userData.value.name = payload.name
      userData.value.age = payload.age
    },
  }
})
const { open, unlock } = useModal('PagePrepareModalC', {
  manual: true,

  // TODO: has bug when not allow open (the tag is not corrent)
  // validate(data) {
  //   // Not allow pass any data
  //   // TODO: click danger button twice will open modal route
  //   return !data
  // },
  props: modalProps,
})

onMounted(async () => {
  await fetchUserData()
  unlock()
})

</script>
<template>
  <PageSection
    title="ModalC"
    description="test useModal"
  >
    <div class="max-w-500px">
      <ElDescriptions
        class="my-4"
        title="User Info"
        direction="vertical"
        :column="4"
        border
      >
        <ElDescriptionsItem label="Username">
          {{ userData.name }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="Age">
          {{ userData.age }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
    <div class="grid gap-3">
      <div>
        <ElButton
          type="primary"
          icon="check"
          @click="open()"
        >
          Open ModalC
        </ElButton>
      </div>
      <!-- <div>
        <ElButton
          type="danger"
          icon="check"
          @click="open({
            data: { name: 'John Doe', age: 30 }
          })"
        >
          Open ModalC with data (not allowed)
        </ElButton>
      </div> -->
    </div>
    <!-- <ElButton
      type="primary"
      icon="unlock"
      @click="unlock()"
    >
      unlock ModalC
    </ElButton> -->
  </PageSection>
</template>
<style></style>
