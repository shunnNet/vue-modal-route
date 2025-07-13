import { defineComponent, h, PropType, watch, computed, toValue, provide, InjectionKey, Ref, shallowReactive, Slot } from 'vue'
import { isPlainObject, useMatchedRoute } from '../utils'
import { modalRouteContext } from '../modalRoute'
import { TComponent, TModalType } from '../types'

// From vue-router
function normalizeSlot(slot: Slot | undefined, data: any) {
  if (!slot) return null
  const slotContent = slot(data)
  return slotContent.length === 1 ? slotContent[0] : slotContent
}

export default defineComponent({
  name: 'ModalRouteView',
  props: {
    component: {
      type: Object as PropType<TComponent>,
      default: null,
    },
    modalType: {
      type: String as PropType<TModalType>,
      default: 'path',
    },
    viewScope: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
  },

  setup(props, { slots }) {
    const matchedRoute = useMatchedRoute()
    const context = modalRouteContext.ensureInjection('ModalRoute must be used inside a ModalRouteContext')
    const { store } = context

    const componentMap: Record<string, TComponent> = shallowReactive({})

    watch(() => props.component, (val) => {
      setupModalIfExist(val)
    }, { immediate: true })

    const _modal = computed(() => {
      const _name = matchedRoute?.value?.name as string
      return store.getUnsafe(_name)
    })

    function setupModalIfExist(cmp: TComponent, name?: string) {
      if (!cmp) {
        return
      }
      const _name = name || matchedRoute?.value?.name as string
      if (!_name) {
        throw new Error('modalName not provided')
      }
      const modal = store.getUnsafe(_name)

      // Check type for preventing render path / global at the same time
      if (!(modal && modal.type === props.modalType)) {
        return
      }

      componentMap[_name] = cmp
    }
    return () => {
      return [
        // Check if current component is modal route component to prevent render modal in this part
        ...(!_modal.value && props.viewScope
          ? slots.default
            ? [normalizeSlot(slots.default, props.viewScope)]
            : [props.viewScope.Component]
          : []),
        ...Object.keys(componentMap).map((name) => {
          return h(
            modalProvider,
            { modal: componentMap[name], name },
            Object.fromEntries(
              Object.entries(slots).flatMap(([key, value]) => {
                const [parsedKey, slotName] = key.split('-')
                return parsedKey === name ? [[slotName, value]] : []
              }),
            ))
        })]
    }
  },
})

export const ModalRouteViewKey: InjectionKey<{
  visible: Ref<boolean>
  closeThenReturn: (value: any) => void
  name: string
}> = Symbol('modal-route-view')

export const modalProvider = defineComponent({
  name: 'ModalRouteProvider',
  props: {
    name: {
      type: String,
      required: true,
    },
    modal: {
      type: Object as PropType<TComponent>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const { store, defineActive, closeModal } = modalRouteContext.ensureInjection('ModalRoute must be used inside a ModalRouteContext')
    const modalRoute = computed(() => store.getUnsafe(props.name))
    const isActive = computed(() => defineActive(props.name))

    const visible = computed({
      get: () => !modalRoute.value?.state.value.locked && isActive.value,
      set: (value) => {
        // Depend on modal component, visible may be set to false after modal route deactivated
        // So we need to check if value is different from modal.isActive
        if (!value && value !== isActive.value) {
          closeModal(props.name)
        }
      },
    })

    const _props = computed(() => {
      const mr = toValue(modalRoute)
      if (!mr) {
        return {}
      }

      // Allow "data" and "props" be `ref` or `reactive`
      let result = {}
      if (typeof mr.options?.props === 'function') {
        // TODO: Check if this may allow data, which is from A component, be modified from "props" function of B component
        result = mr.options.props(toValue(mr.state.value.data))
      }
      else if (isPlainObject(mr.options?.props)) {
        result = {
          ...toValue(mr.options?.props),
          ...toValue(mr.state.value.data), // data has higher priority
        }
      }
      else if (mr.state.value.data) {
        result = toValue(mr.state.value.data)
      }
      return { ...result }
    })
    const closeThenReturn = (value: unknown) => {
      modalRoute.value?.setReturnValue(value)
      visible.value = false
    }
    provide(ModalRouteViewKey, {
      visible,
      closeThenReturn,
      name: props.name,
    })
    return () => {
    // TODO: Will slot updated when slot changed from setupModal ?
      return h(
        props.modal,
        _props.value,
        isPlainObject(modalRoute.value?.options?.slots)
          ? Object.assign(slots, modalRoute.value.options.slots)
          : slots,
      )
    }
  },
})
