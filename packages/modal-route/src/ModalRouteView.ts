import { defineComponent, h, PropType, watch, computed, toValue, provide, InjectionKey, Ref, ComputedRef, shallowReactive, WritableComputedRef } from 'vue'
import { isPlainObject } from './helpers'
import { modalRouteContext } from './modalRoute'
import { TComponent, TModalRouteContext, TModalType } from './types'
import { useMatchedRoute } from './router'

type TModalState = {
  _component: TComponent
  visible: WritableComputedRef<boolean>
  props: ComputedRef<Record<string, any>>
  slots: Record<string, any>
  setVisible: (value: boolean) => void
}
type TModalStateMap = Record<string, TModalState>

const createModalState = (name: string, modalRouteContext: TModalRouteContext) => {
  const { getModalItem, closeModal } = modalRouteContext
  const modal = getModalItem(name)

  const visible = computed({
    get: () => !modal._manualLocked && modal.isActive,
    set: (value) => {
      // Depend on modal component, visible may be set to false after modal route deactivated
      // So we need to check if value is different from modal.isActive
      if (!value && value !== modal.isActive) {
        closeModal(name)
      }
    },
  })
  const setVisible = (value: boolean) => {
    visible.value = value
  }

  // TODO: Will slot updated when slot changed from setupModal ?
  const slots = isPlainObject(modal.options?.slots)
    ? modal.options.slots
    : {}

  const props = computed(() => {
    // Allow "data" and "props" be `ref` or `reactive`
    let result = {}
    if (typeof modal?.options?.props === 'function') {
      // TODO: Check if this may allow data, which is from A component, be modified from "props" function of B component
      result = modal.options.props(toValue(modal.data))
    }
    else if (isPlainObject(modal?.options?.props)) {
      result = {
        ...toValue(modal?.options?.props),
        ...toValue(modal.data), // data has higher priority
      }
    }
    return result || {}
  })

  return {
    visible,
    props,
    slots,
    setVisible,
  }
}

export default defineComponent({
  name: 'ModalRouteView',
  props: {
    components: {
      type: Array as PropType<TComponent[] | { modalName: string, component: TComponent }[]>,
      default: () => [],
    },
    modalType: {
      type: String as PropType<TModalType>,
      required: true,
    },
  },

  setup(props, { slots }) {
    const matchedRoute = useMatchedRoute()
    const context = modalRouteContext.ensureInjection('ModalRoute must be used inside a ModalRouteContext')
    const { getModalItemUnsafe } = context

    const componentMap: TModalStateMap = shallowReactive({})

    watch(() => props.components, (val) => {
      val.filter(Boolean).forEach(cmp => 'modalName' in cmp
        ? setupModalIfExist(cmp.component, cmp.modalName)
        : setupModalIfExist(cmp),
      )
    }, { immediate: true })

    function setupModalIfExist(cmp: TComponent, name?: string) {
      if (!cmp) {
        return
      }
      const _name = name || matchedRoute?.value?.name as string
      if (!_name) {
        throw new Error('modalName not provided')
      }
      const modal = getModalItemUnsafe(_name)
      if (!(modal && modal.type === props.modalType)) {
        return
      }
      componentMap[_name] = {
        ...componentMap[_name] || createModalState(_name, context),
        _component: cmp,
      }
    }
    return () => {
      return Object.keys(componentMap).map((name) => {
        return h(
          modalProvider,
          { modal: componentMap[name], name },
          Object.fromEntries(
            Object.entries(slots).flatMap(([key, value]) => {
              const [parsedKey, slotName] = key.split('-')
              return parsedKey === name ? [[slotName, value]] : []
            }),
          ))
      })
    }
  },
})

export const ModalRouteViewKey: InjectionKey<{
  visible: Ref<boolean>
  closeThenReturn: (value: any) => void
  name: string
}> = Symbol('modal-route-view')

const modalProvider = defineComponent({
  name: 'ModalRouteProvider',
  props: {
    name: {
      type: String,
      required: true,
    },
    modal: {
      type: Object as PropType<TModalState>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const { setModalReturnValue } = modalRouteContext.ensureInjection('ModalRoute must be used inside a ModalRouteContext')
    const closeThenReturn = (value: unknown) => {
      setModalReturnValue(props.name, value)
      props.modal.setVisible(false)
    }

    provide(ModalRouteViewKey, {
      visible: props.modal.visible,
      closeThenReturn,
      name: props.name,
    })
    return () => {
      return h(
        props.modal._component,
        props.modal.props.value,
        Object.assign(slots, props.modal.slots),
      )
    }
  },
})
