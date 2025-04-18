import { defineNuxtPlugin, useRuntimeConfig, useNuxtApp } from '#app'
import provider from '#build/provider'
import type IApiProvider from '#build/provider'

export default defineNuxtPlugin(() => {
  const api: IApiProvider = provider

  return {
    provide: { api: api },
  }
})
