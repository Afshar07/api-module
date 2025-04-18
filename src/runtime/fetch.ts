import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin(() => {
  // const interceptors = useDefaultInterceptors()

  // Configure with your own baseUrl
  const baseUrl = useRuntimeConfig().public.apiAddress

  const fetchInstance = $fetch.create({
    baseURL: `${baseUrl}/api`,
    // onRequest: interceptors.value.onRequest,
    // onRequestError: interceptors.value.onRequestError,
    // onResponse: interceptors.value.onResponse,
    // onResponseError: interceptors.value.onResponseError,
  })
  return {
    provide: {
      fetch: fetchInstance,
    },
  }
})
