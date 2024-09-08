import { inject, InjectionKey, provide } from 'vue'
import { Rejection } from './rejection'
import { TCreateRejection } from './types'
import { useModalRouteContext } from './modalRouteContext'
import { useRouter } from 'vue-router'

export type TSetupModalOptions = {
  data?: {
    handler: (
      data: Record<string, any>,
      reject: TCreateRejection
    ) => Record<string, any> | Rejection
    mode?: 'beforeVisible' | 'afterVisible'
  }
}
type TPathModalContext = Record<string, TSetupModalOptions>
type TUsePathModalKey = InjectionKey<TPathModalContext>
const usePathModalKey: TUsePathModalKey = Symbol('usePathModal')
export const usePathModal = () => {
  const ctx: TPathModalContext = {}
  const router = useRouter()
  const { push } = useModalRouteContext()

  const setupModal = (name: string, options: TSetupModalOptions = {}) => {
    ctx[name] = options
    return {
      open: (data: any = null) => openModal(name, data),
    }
  }
  // TODO: Should data be restored when previous page?
  const openModal = (name: string, data: any = null) => {
    console.log('openModal', name, data)

    push(name, data)
    router.push({ name })
  }

  provide(usePathModalKey, ctx)

  return {
    setupModal,
    openModal,
  }
}

export const injectPathModal = () => {
  const ctx = inject(usePathModalKey, {})
  return ctx
}
