<script setup lang="ts">
import { useModalRoute, ModalPathView, ModalRouterView } from '@vmr/vue-modal-route'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const visible = defineModel<boolean>()

const route = useRoute()
const router = useRouter()
console.log(router.getRoutes());

onMounted(() => {
  console.log(route.params)
})

defineProps<{
  message?: string
}>()

defineEmits<{
  (e: 'return', value: string): void
}>()

const { closeModal } = useModalRoute()
</script>
<template>
  <ElDialog v-model="visible" title="ModalTest">
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
      <!-- <RouterView name="modal-default"/> -->
      <ModalRouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
            <component :is="Component" />
        </Transition>
      </ModalRouterView>
    </div>
    <template #footer>
      <ElButton type="warning" @click="closeModal('ModalTest')">
        Close
      </ElButton>
      <ElButton type="success" @click="$emit('return', 'ModalTest return value')">
        Return
      </ElButton>
    </template>
  </ElDialog>
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
