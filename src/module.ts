import { defineNuxtModule, addPlugin, createResolver, addImportsDir, addImports, useLogger, resolveFiles, addTemplate, addTypeTemplate } from '@nuxt/kit'
import { genInterface } from 'knitwork'

import { defu } from 'defu'
import { filename } from 'pathe/utils'
import { name, version } from '../package.json'
import type { IModuleOptions } from './types'

export default defineNuxtModule<IModuleOptions>({
  meta: {
    name,
    configKey: 'api',
    version,
  },
  // Default configuration options of the Nuxt module
  defaults: {
    baseUrl: '/',
  },

  async setup(options, nuxt) {
    const logger = useLogger('api-module')
    if (!options.baseUrl) {
      logger.warn('\'baseUrl\' option is not filled, Using \'/\' as the base URL.')
    }

    const { resolve: resolveServices } = createResolver(nuxt.options.rootDir)

    const servicesDir = resolveServices('services')
    const servicesFiles = await resolveFiles(servicesDir, '*.{js,ts}')

    if (!servicesFiles || !servicesFiles.length) {
      logger.warn('No Service files found in service directory, provider not generated!')
      return
    }

    const servicesFileNames: string[] = []
    const fileTypes: Record<string, string> = {}

    servicesFiles.forEach((serviceFile) => {
      const name = filename(serviceFile)

      if (name) {
        servicesFileNames.push(name)
        fileTypes[name] = name
      }
    })

    addImportsDir(resolveServices('services'))

    function generateTypeTemplate() {
      let contents = `
      `
      for (let i = 0; i < servicesFileNames.length; i++) {
        contents += `
        import type ${servicesFileNames[i]} from '@/services/${servicesFileNames[i]}'
        `
      }

      contents += `
      declare module "#app" {
  interface NuxtApp {
    $api: IApiProvider;
  }
}

        declare global {

      ${genInterface('IApiProvider', fileTypes)}`

      contents += `
    }
      export {};`

      return contents
    }

    function generateProviderFile() {
      let contents = `
      export default
      `

      contents += `
      {
      `
      for (let i = 0; i < servicesFileNames.length; i++) {
        contents += `
          ${servicesFileNames[i]}: new ${servicesFileNames[i]}(useHttpClient)${i < servicesFileNames.length ? ',' : ''}
        `
      }

      contents += `
    }
      `

      return contents
    }

    addTypeTemplate({
      filename: 'types/apiProvider.d.ts',
      getContents: () => /* ts */`
      ${generateTypeTemplate()}
      `,
    })
    addTemplate({
      filename: 'provider.ts',
      getContents: () => `
      ${generateProviderFile()}
      `,
    })

    nuxt.options.runtimeConfig.public.api = defu<IModuleOptions, IModuleOptions[]>(nuxt.options.runtimeConfig.public.api, {
      baseUrl: '/',
    })

    const { resolve } = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addImports({
      name: 'useHttpClient',
      as: 'useHttpClient',
      from: resolve('./runtime/composables/useHttpClient'),
    })
    addPlugin(resolve('./runtime/fetch'))
    addPlugin(resolve('./runtime/provider'))
  },
})
