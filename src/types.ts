// Module options TypeScript interface definition
export interface IModuleOptions {
  /**
   * Set the base url for the requests.
   * @default '/'
   */
  baseUrl?: string

  /**
   * Refreshes flags on window resize.
   * @default false
   * @deprecated
   */
  // refreshOnResize?: boolean
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    api: IModuleOptions
  }
}
