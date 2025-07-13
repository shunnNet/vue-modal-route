import { createNuxtModalRoute } from '@vmrh/core'
import { vmrhContext } from './context'
import { defineNuxtPlugin, useRouter } from 'nuxt/app'
// @ts-expect-error - build file
import modalLayouts from '#build/modal-layout.mjs'
// @ts-expect-error - build file
import modalQuery from '#build/modal-query.mjs'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const modalRoute = createNuxtModalRoute(
    {
      global: vmrhContext.global,
      layout: modalLayouts,
      query: modalQuery,
    },
    router,
    vmrhContext.history,
  )

  nuxtApp.vueApp.use(modalRoute)
})
