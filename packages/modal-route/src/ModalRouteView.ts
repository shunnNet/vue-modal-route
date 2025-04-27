import { defineComponent, h, PropType, watch, computed, reactive, ref, toValue, provide, toRefs, InjectionKey, Ref, ComputedRef } from 'vue'
import { isPlainObject } from './helpers'
import { modalRouteContext, useModalRoute } from './modalRoute'
import { TComponent, TModalType } from './types'
import { useMatchedRoute } from './router'

type TModalMap = Record<string, {
  _component: TComponent
  visible: boolean
  props: Record<string, any>
  propsInited: boolean
  loading: boolean
  setVisible: (value: boolean) => Promise<void>
  _visible: boolean
  slots: Record<string, any>
  _data: any
}>

const setupModalRoute = () => {
  const { pop, getModalItem } = modalRouteContext.ensureInjection('ModalRoute must be used inside a ModalRoute component')
  const { closeModal, isModalActive } = useModalRoute()

  const componentMap: TModalMap = reactive({})

  const createVisible = (
    defineVisible: () => boolean,
    closeAction: () => Promise<void>,
  ) => {
    const _visible = ref(false)
    const visible = computed({
      get: () => defineVisible() && _visible.value,
      set: value => setVisible(value),
    })
    const setVisible = async (value: boolean) => {
      if (value) {
        _visible.value = true
      }
      else {
        await closeAction()
        _visible.value = false
      }
    }
    return { visible, setVisible, _visible }
  }

  const setModal = (name: string, component: TComponent) => {
    const modalItem = getModalItem(name)
    if (componentMap[name]) {
      componentMap[name]._component = component
    }
    else {
      const { visible, setVisible, _visible } = createVisible(
        () => isModalActive(name),
        async () => {
          await closeModal(name)
          componentMap[name].propsInited = false
        },
      )
      watch(visible, (value) => {
        if (value === false) {
          _visible.value = false
          componentMap[name].propsInited = false
        }
      })

      const loading = ref(false)

      const modalSlots = isPlainObject(modalItem?.options?.slots)
        ? modalItem?.options?.slots
        : {}

      // TODO: How to handle reactive unwrap type ?
      componentMap[name] = {
        _component: component,
        visible: visible as unknown as boolean,
        setVisible,
        loading: loading as unknown as boolean,
        props: computed(() => {
          let result = componentMap[name]._data
          if (typeof modalItem?.options?.props === 'function') {
            result = modalItem.options.props(result)
          }
          else if (isPlainObject(modalItem?.options?.props)) {
            result = modalItem?.options?.props
          }
          return toValue(result || {})
        }),
        slots: modalSlots,
        _visible: _visible as unknown as boolean,
        propsInited: false,
        _data: {},
      }
    }
    if (!componentMap[name].propsInited) {
      // TODO: FIXME: I will be ran twice because closeModal's query updated
      const data = pop(name)
      if (modalItem?.options?.validate?.(data)) {
        componentMap[name].setVisible(false)
        return
      }
      componentMap[name]._data = data
      componentMap[name].setVisible(true)
      componentMap[name].propsInited = true
    }
  }

  return { setModal, componentMap }
}

export default defineComponent({
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
    const { setModal, componentMap } = setupModalRoute()
    const { closeModal } = useModalRoute()
    const matchedRoute = useMatchedRoute()
    const {
      getModalItemUnsafe,
      setModalReturnValue,
    } = modalRouteContext.ensureInjection('ModalRoute must be used inside a ModalRouteContext')

    const setupModalIfExist = (cmp: TComponent, name?: string) => {
      if (!cmp) {
        return
      }
      const _name = name || matchedRoute?.value?.name as string
      if (!_name) {
        throw new Error('modalName not provided')
      }
      const modal = getModalItemUnsafe(_name)
      if (modal && modal.type === props.modalType) {
        setModal(_name, cmp)
      }
    }

    props.components.filter(Boolean).forEach(
      cmp => 'modalName' in cmp
        ? setupModalIfExist(cmp.component, cmp.modalName)
        : setupModalIfExist(cmp),
    )

    watch(() => props.components, (val) => {
      if (!val.length) {
        return
      }
      val.filter(Boolean).forEach(cmp => 'modalName' in cmp
        ? setupModalIfExist(cmp.component, cmp.modalName)
        : setupModalIfExist(cmp),
      )
    })
    return () => {
      return Object.entries(componentMap).map(([name, { _component }]) => {
        const _slots = Object.fromEntries(
          Object.entries(slots).flatMap(([key, value]) => {
            const [parsedKey, slotName] = key.split('-')
            if (parsedKey === name) {
              return [[slotName, value]]
            }
            else {
              return []
            }
          }),
        )
        const modal = componentMap[name]
        return h(modalProvider, {
          'modelValue': modal.visible,
          'onUpdate:modelValue': (value: boolean) => modal.visible = value,
          'loading': modal.loading,
          'onReturn': ($event: any) => {
            setModalReturnValue(name, $event)
            closeModal(name)
          },
          'modalName': name,
        }, {
          default: () => h(
            _component,
            modal.props,
            Object.assign(_slots, modal.slots),
          ),
        })
      })
    }
  },
})

export const ModalRouteViewKey: InjectionKey<{
  modelValue: Ref<boolean>
  loading: Ref<boolean>
  closeThenReturn: (value: any) => void
  name: ComputedRef<string>
}> = Symbol('modal-route-view')

const modalProvider = defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    modalName: {
      type: String,
      required: true,
    },
  },
  emits: ['return', 'update:modelValue'],
  setup(props, { slots, emit }) {
    const { modelValue, loading } = toRefs(props)
    const closeThenReturn = (value: unknown) => {
      emit('return', value)
      emit('update:modelValue', false)
    }
    const visible = computed({
      get: () => modelValue.value,
      set: value => emit('update:modelValue', value),
    })
    provide(ModalRouteViewKey, {
      modelValue: visible,
      loading,
      closeThenReturn,
      name: computed(() => props.modalName),
    })
    return () => slots.default?.()
  },
})
