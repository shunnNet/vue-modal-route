<script setup lang="ts">
import { useModalRoute } from './modalRoute'

// ts-expect-error library bug
// ...RouterLink.props,

const props = defineProps({
  data: {
    type: Object,
    default: () => null,
  },
  name: {
    type: String,
    required: true,
  },
})
const { openModal } = useModalRoute()

const onClick = () => {
  openModal(props.name, { data: props.data })
}
</script>
<template>
  <!-- :href="href" -->
  <a
    @click.prevent="onClick"
  ><slot /></a>
</template>
<style></style>
