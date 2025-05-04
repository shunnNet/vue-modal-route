// import { defineNuxtPlugin } from '#build/imports'
import { createNuxtModalRoute, createModalRoute } from '@vmrh/core'
import { history, globalModal } from './router.options'
import { defineNuxtPlugin, useRouter } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const modalRoute = import.meta.client
    ? createModalRoute({
      router,
      history: history.h,
      global: globalModal,
    })
    : createNuxtModalRoute({
      router,
      history: history.h,
      global: globalModal,
    })
  nuxtApp.vueApp.use(modalRoute)
})
