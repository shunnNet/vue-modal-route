<script setup lang="ts">
import { RouterLink, useLink } from 'vue-router'
import { modalRouteContextKey, useModalRoute } from './modalRouteContext'
import { inject } from 'vue'
import { ensureInjection } from './helpers'

// ts-expect-error library bug
// ...RouterLink.props,

const props = defineProps({
  data: {
    type: Object,
    default: () => null,
  },
  to: {
    type: Object,
    required: true,
  },
  // name: {
  //   type: String,
  //   required: true,
  // },
})
// const {
//   // the resolved route object
//   route,
//   // the href to use in a link
//   href,
//   // boolean ref indicating if the link is active
//   isActive,
//   // boolean ref indicating if the link is exactly active
//   isExactActive,
//   // function to navigate to the link
//   navigate,
// } = useLink(props)

const { openModal } = useModalRoute()

const onClick = () => {
  openModal(props.to.name, props.data)
}
</script>
<template>
  <!-- :href="href" -->
  <a
    @click.prevent="onClick"
  ><slot /></a>
</template>
<style></style>
