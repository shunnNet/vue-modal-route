<script setup lang="ts">
import { ModalRouterView, useCurrentModal, ModalLayout } from '@vmr/vue-modal-route'
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()

defineProps<{
  message?: string
}>()

const { closeThenReturn, close } = useCurrentModal<string>()
const router = useRouter()
onMounted(() => {
  console.log('ModalTest mounted')
  console.log(router.getRoutes());
})
</script>
<template>
  <ModalLayout title="ModalTest">
    <div>
      Message from parent: {{ message }}
    </div>
    <div>
      Route params: {{ route.params }}
    </div>
    <slot name="custom" custom="custom" />
    <div>
      <h4>
        Child view:
      </h4>
      <RouterLink :to="{ name: 'ModalTestChild2', params: { foo: 'bar' } }">
        Go to test2
      </RouterLink>
      <RouterLink :to="{ name: 'ModalTestChild', params: { foo: 'bar' } }">
        Go to test
      </RouterLink>
      <RouterView name="modal-default"/>
      <ModalRouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
            <component :is="Component" />
        </Transition>
      </ModalRouterView>
    </div>
    <template #footer>
      <ElButton type="warning" @click="close()">
        Close
      </ElButton>
      <ElButton type="success" @click="closeThenReturn('ModalTest return value')">
        Return
      </ElButton>
    </template>
  </ModalLayout>
</template>
<style>
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

</style>
