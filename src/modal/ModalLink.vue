<script setup lang="ts">
import { RouterLink, useLink } from 'vue-router'
import { modalRouteContextKey, useModalRoute } from './modalRouteContext'
import { inject } from 'vue'
import { ensureInjection } from './helpers'

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

const { push } = ensureInjection(
  modalRouteContextKey,
  'ModalRoute must be used inside a ModalRoute component',
)

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
