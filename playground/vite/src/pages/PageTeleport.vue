<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import imageSrc from '~/assets/image.jpg'
const enabled = ref(false)
const wrapperRef = shallowRef<HTMLElement | null>(null)
const target = shallowRef<HTMLElement | null>(null)
const runAnimation = ref(false)

const onToggle = (active: boolean) => {
  if (!wrapperRef.value || !target.value) {
    return
  }
  const { top, left } = wrapperRef.value.getBoundingClientRect()
  enabled.value = active
  if (active) {
    const height = wrapperRef.value?.scrollHeight
    const width = wrapperRef.value?.scrollWidth
    wrapperRef.value.style.width = `${width}px`
    wrapperRef.value.style.height = `${height}px`
    target.value.style.width = `${width}px`
    target.value.style.height = `${height}px`

    target.value.style.top = `${top}px`
    target.value.style.left = `${left}px`
    setTimeout(() => {
      runAnimation.value = true
    }, 0)
  }
  else {
    wrapperRef.value.style.width = ''
    wrapperRef.value.style.height = ''
    setTimeout(() => {
      runAnimation.value = false
    }, 0)
  }
}
</script>
<template>
  <div>
    <div
      v-show="enabled"
      class="fixed bg-black/60 inset-0"
      @click="onToggle(false)"
    />
    <section class="w-500px mx-auto ">
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>

      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <div
        ref="wrapperRef"
        @click="onToggle(!enabled)"
      >
        <Teleport
          to="body"
          :disabled="!enabled"
        >
          <div
            ref="target"
            :class="{
              'fixed': enabled,
              'transform scale-200 transform-origin-center': runAnimation,
              'transition duration-300 transform scale-100': true
            }"
          >
            <div>
              <img
                :src="imageSrc"
                class="max-w-full h-auto"
                width="5000"
                height="4000"
              >
            </div>
          </div>
        </Teleport>
      </div>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
      <p class="my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo ab ducimus necessitatibus at eos. Fugiat ipsum debitis enim laboriosam neque consequuntur eius numquam cum, quidem modi, ratione voluptatum inventore maiores.
      </p>
    </section>
  </div>
</template>
<style></style>
