import { defineNuxtModule, addPlugin, createResolver, resolveFiles } from '@nuxt/kit'
import { relative, resolve } from 'pathe'

// Module options TypeScript interface definition
export interface ModuleOptions {
  // Module option
  temp?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))

    _nuxt.hooks.hook('pages:routerOptions', ({ files }) => {
      files.push({
        path: resolver.resolve('./runtime/router.options'),
      })
    })
    // const globalModalDir = resolve(
    //   _nuxt.options.rootDir,
    //   'modals/global',
    // )
    // Note: check ignore doc
    // https://www.npmjs.com/package/ignore
    // const files = (await resolveFiles(globalModalDir, '**/*.vue')).map((f) => {
    //   return {
    //     relativePath: relative(globalModalDir, f),
    //     absolutePath: f,
    //   }
    // })

    // sort scanned files using en-US locale to make the result consistent across different system locales
    // files.sort((a, b) => a.relativePath.localeCompare(b.relativePath, 'en-US'))

    // _nuxt.hooks.hook('pages:resolved', (pages) => {
    //   console.log('pages:resolved', pages)
    //   // pages.forEach((page) => {
    //   //   // page.
    //   //   if (page.name === 'user@modal') {
    //   //     console.log('user@modal', page)
    //   //   }
    //   // })
    // })
  },
})
