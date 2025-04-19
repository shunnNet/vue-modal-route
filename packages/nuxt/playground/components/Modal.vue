<template>
  <!-- <Teleport to="body"></Teleport> -->
    <Transition name="fade">
      <div v-if="visible" class="modal-overlay" @click="visible = false">
        <div class="modal-container" @click.stop>
          <div class="modal-content">
            <header class="modal-header">
              <slot name="header"></slot>
            </header>
            <div class="modal-body">
              <slot name="body"></slot>
            </div>
            <footer class="modal-footer">
              <slot name="footer"></slot>
            </footer>
          </div>
        </div>
      </div>
    </Transition>

</template>

<script setup lang="ts">
const visible = defineModel<boolean>()

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  max-height: 90vh;
  overflow: auto;
}

.modal-content {
  display: flex;
  flex-direction: column;
  min-width: 300px;
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.modal-body {
  padding: 16px;
  flex: 1;
  overflow: auto;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #eee;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
