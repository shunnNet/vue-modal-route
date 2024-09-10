import { Component, inject, InjectionKey, markRaw } from 'vue'
import { RouteRecordRaw, RouteRecordSingleViewWithChildren } from 'vue-router'
import { TModalPathRoute } from './types'

export const ensureInjection = <T = unknown>(injectKey: string | InjectionKey<T>, errorMsg: string) => {
  const injection = inject(injectKey)

  if (!injection) {
    throw new Error(errorMsg)
  }

  return injection
}

export const isPlainObject = (value: unknown): value is Record<string, any> => {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Checks if a value is null or undefined.
 *
 * @param v - The value to check.
 * @returns True if the value is null or undefined, false otherwise.
 */
export const isNullish = (v: any) => v === null || v === undefined

/**
 * Ensures that the input value is converted to an array.
 * If the input value is nullish (undefined or null), an empty array is returned.
 * If the input value is already an array, it is returned as is.
 * If the input value is not an array, it is wrapped in an array and returned.
 *
 * @param v - The value to ensure as an array.
 * @returns An array containing the input value or a wrapped version of it.
 */
export const ensureArray = <T>(v: T | T[]) => isNullish(v) ? [] : Array.isArray(v) ? v : [v]
