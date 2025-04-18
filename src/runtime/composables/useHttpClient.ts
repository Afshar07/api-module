import type { NitroFetchRequest, AvailableRouterMethod as _AvailableRouterMethod } from 'nitropack'
import { useNuxtApp, useFetch } from '#app'

type DefaultAsyncDataValue = null

export type KeysOf<T> = Array<T extends T ? keyof T extends string ? keyof T : never : never>

export interface UseFetchOptions<ResT, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = DefaultAsyncDataValue, R extends NitroFetchRequest = string & {}, M extends AvailableRouterMethod<R> = AvailableRouterMethod<R>> extends Omit<AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>, 'watch'>, ComputedFetchOptions<R, M> {
  key?: string
  $fetch?: typeof globalThis.$fetch
  watch?: false
}
export declare function useFetch<ResT = void, ErrorT = FetchError, ReqT extends NitroFetchRequest = NitroFetchRequest, Method extends AvailableRouterMethod<ReqT> = ResT extends void ? 'get' extends AvailableRouterMethod<ReqT> ? 'get' : AvailableRouterMethod<ReqT> : AvailableRouterMethod<ReqT>, _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT, DataT = _ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = DefaultAsyncDataValue>(request: Ref<ReqT> | ReqT | (() => ReqT), opts?: UseFetchOptions<_ResT, DataT, PickKeys, DefaultT, ReqT, Method>): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, ErrorT | DefaultAsyncDataErrorValue>

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
