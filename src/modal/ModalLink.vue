<script setup lang="ts">
import { RouterLink, useLink } from 'vue-router'
import { computed, inject } from 'vue'
import { useModalRouteContext } from './modalRouteContext'

const props = defineProps({
  // @ts-expect-error library bug
  ...RouterLink.props,
  inactiveClass: String,
  data: {
    type: Object,
    default: () => null,
  },
  // name: {
  //   type: String,
  //   required: true,
  // },
})
const {
  // the resolved route object
  route,
  // the href to use in a link
  href,
  // boolean ref indicating if the link is active
  isActive,
  // boolean ref indicating if the link is exactly active
  isExactActive,
  // function to navigate to the link
  navigate,
} = useLink(props)
const { push } = useModalRouteContext()
const onClick = () => {
  push(props.to.name, props.data)
  navigate()
}
</script>
<template>
  <a
    :href="href"
    @click.prevent="onClick"
  ><slot /></a>
</template>
<style></style>
