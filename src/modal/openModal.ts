import { useRouter } from 'vue-router'
import { useModalRouteContext } from './modalRouteContext'

export const useOpenModal = () => {
  const router = useRouter()
  const { push } = useModalRouteContext()

  // TODO: The data should be restored when previous page?
  const openModal = (name: string, data: any = null) => {
    console.log('openModal', name, data)

    push(name, data)
    router.push({ name })
  }
  return {
    openModal,
  }
}
