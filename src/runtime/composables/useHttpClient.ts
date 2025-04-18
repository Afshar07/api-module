import { useNuxtApp, useFetch, type UseFetchOptions } from '#app'

export function useHttpClient<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>,
) {
  const { $fetch } = useNuxtApp()
  return useFetch(url, {
    ...options,
    $fetch: $fetch,
  })
}
