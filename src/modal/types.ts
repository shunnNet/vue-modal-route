import { InjectionKey } from 'vue'
import { NavigationFailure, RouteRecordNameGeneric, RouteRecordNormalized } from 'vue-router'

export type TModalData = Record<string, any>

export type TModalDataExtend<T extends TModalData> = T

export type TModal<T extends TModalData = TModalData, R = any> = {
  visible: boolean
  data: Partial<T>
  close: (returnValue?: R) => Promise<R>
  open: (data?: TModalDataExtend<T>) => Promise<any>
  patchData: (data: Partial<TModalDataExtend<T>>) => void
  resetData: () => void
  // modalValue: R | undefined
  _id: number

}
export type TRegistModal = (
  name: string,
  initValue: TModalData,
  resetAfterClose?: boolean
) => void
export type TUnregisterModal = (name: string, _id: any) => void
export type TOpenModal<T = any> = (name: keyof TModalMap, data?: TModalData) => Promise<T>
export type TModalMap = Record<string, Omit<TModal, 'visible'> & { visible: boolean, _id: number }>
export type TPatchModalFunctionData = (data: TModalData) => TModalData
export type TPatchModalData = (
  name: string,
  patchData: TModalData | TPatchModalFunctionData
) => void
export type TCloseModal = (name: keyof TModalMap, data?: any) => void

// ------------------------------------------------

export type TModalMapModal = {
  data: Record<string, any> | null
  parent: RouteRecordNormalized
}
export type TModalMapPush = (name: string, data: Record<string, any>) => void
export type TModalMapPop = (name: string) => TModalMapModal
export type TModalMapBackToParent = (
  name: string,
  mode?: 'push' | 'replace'
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => Promise<void | NavigationFailure | undefined>

export type TModalRouteContext = {
  push: TModalMapPush
  pop: TModalMapPop
  backToParent: TModalMapBackToParent
  store: Record<string, TModalMapModal>
  getModalRoute: (name: string) => TModalMapModal
}

export type TModalRouteContextKey = InjectionKey<TModalRouteContext>
