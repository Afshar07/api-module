import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addImportsDir,
  addImports,
  useLogger,
  resolveFiles,
  addTemplate,
  addTypeTemplate,
  updateTemplates,
} from '@nuxt/kit'
import { genInterface, genImport } from 'knitwork'

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

    const isV4Compatible = nuxt.options.future.compatibilityVersion == 4

    const { resolve: resolveServices } = createResolver(nuxt.options.rootDir)

    const servicesDir = resolveServices(isV4Compatible ? 'app/services' : 'services')

    let servicesFiles = await resolveFiles(servicesDir, '*.{js,ts}')

    if (!servicesFiles || !servicesFiles.length) {
      logger.warn(
        'No Service files found in service directory, provider not generated!',
      )
      return
    }

    const servicesFileNames: string[] = []
    const fileTypes: Record<string, string> = {}

    servicesFiles.forEach((serviceFile) => {
      const name = filename(serviceFile)

      if (name) {
        if (!servicesFileNames.includes(name))
          servicesFileNames.push(name)
        if (!fileTypes[name])
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

    interface IImportExportResult {
      imports: string
      instances: string
    }

    function createImportAndExportForProvider(): IImportExportResult {
      const payload: IImportExportResult = {
        imports: '',
        instances: '',
      }

      for (let i = 0; i < servicesFileNames.length; i++) {
        payload.imports += `
        ${genImport('@/services/' + servicesFileNames[i], servicesFileNames[i])}
        `

        payload.instances += `
          ${servicesFileNames[i]}: new ${servicesFileNames[i]}(useHttpClient)${
            i < servicesFileNames.length ? ',' : ''
          }
        `
      }

      return payload
    }

    function generateProviderFile() {
      const importExportResult: IImportExportResult = createImportAndExportForProvider()
      let contents = `
      `

      contents += importExportResult.imports

      contents += `
      export default
      {
      `
      contents += importExportResult.instances

      contents += `
    }
      `

      return contents
    }

    addTypeTemplate({
      filename: 'types/apiProvider.d.ts',
      getContents: () => /* ts */ `
      ${generateTypeTemplate()}
      `,
    })
    addTemplate({
      filename: 'provider.ts',
      write: true,
      getContents: () => `
      ${generateProviderFile()}
      `,
    })

    nuxt.hook('builder:watch', async (event, relativePath) => {
      if (event === 'change' && !relativePath.startsWith('services')) {
        return
      }

      servicesFiles = await resolveFiles(servicesDir, '*.{js,ts}')
      for (let i = 0; i < servicesFiles.length; i++) {
        const name = filename(servicesFiles[i])
        if (name) {
          if (!servicesFileNames.includes(name))
            servicesFileNames.push(name)
          if (!fileTypes[name])
            fileTypes[name] = name
        }
      }
      await updateTemplates({
        filter: (template) => {
          return template.filename === 'provider.ts'
        },
      })
    })

    nuxt.hook('vite:extendConfig', (config) => {
      config.server.watch = {
        
      }
      if (!config.server) config.server = {}
      if (!config.server.hmr) config.server.hmr = {}

      // Force the HMR system to check for changes in the plugin
      const pluginPath = resolve(nuxt.options.buildDir, 'provider.ts')
      // config.server.hmr = 
      config.server.hmr.include = config.server.hmr. || []
      if (!config.server.hmr.include.includes(pluginPath)) {
        config.server.hmr.include.push(pluginPath)
      }
    })

    nuxt.options.runtimeConfig.public.api = defu<
      IModuleOptions,
      IModuleOptions[]
    >(nuxt.options.runtimeConfig.public.api, {
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
