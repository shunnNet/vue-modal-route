import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  resolveFiles,
  addTemplate,
  updateTemplates,
  addComponent,
  addImports,
} from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { relative, resolve } from 'pathe'

export default defineNuxtModule({
  meta: {
    name: '@vmrh/nuxt',
    configKey: 'vmrh',
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

    const getLayoutContents = async () => {
      const layouts = await scanLayouts(_nuxt, 'modal/layout')
      const layoutsMap = layouts.map((l) => {
        return `'${l.name}': defineAsyncComponent(() => import('${l.absolutePath}')),`
      }).join('\n')
      return [
        `import { defineAsyncComponent } from 'vue'`,
        `export default {`,
        `  ${layoutsMap}`,
        `}`,
      ].join('\n')
    }
    addTemplate({
      filename: 'modal-layout.mjs',
      getContents: getLayoutContents,
    })

    _nuxt.hook('builder:watch', async (event, path) => {
      if ((event === 'add' || event === 'unlink') && path.startsWith('modal/layout')) {
        updateTemplates({
          filter: template => template.filename === 'modal-layout.mjs',
        })
      }
    })

    const getQueryContents = async () => {
      const query = await scanQuery(_nuxt, 'modal/query')
      const queryMap = query.map((q) => {
        return `{ name: '${q.name}', component: defineAsyncComponent(() => import('${q.absolutePath}')) },`
      }).join('\n')
      return [
        `import { defineAsyncComponent } from 'vue'`,
        `export default [`,
        `  ${queryMap}`,
        `]`,
      ].join('\n')
    }

    addTemplate({
      filename: 'modal-query.mjs',
      getContents: getQueryContents,
    })

    _nuxt.hook('builder:watch', async (event, path) => {
      if ((event === 'add' || event === 'unlink') && path.startsWith('modal/query')) {
        updateTemplates({
          filter: template => template.filename === 'modal-query.mjs',
        })
      }
    })
    ;[
      'ModalRouterView',
      'ModalGlobalView',
      'ModalQueryView',
      'ModalLayout',
    ].forEach((name) => {
      addComponent({ name, export: name, filePath: '@vmrh/core' })
    })

    ;[
      'useModalRoute',
      'setupModal',
      'useCurrentModal',
      'useModal',
      'useModalReturnValue',
      'useModalActive',
    ].forEach((name) => {
      addImports({ name, from: '@vmrh/core' })
    })
  },
})

async function scanLayouts(nuxt: Nuxt, dir: string) {
  const layoutsDir = resolve(nuxt.options.srcDir, dir)
  const files = (await resolveFiles(layoutsDir, '*.vue')).map((f) => {
    return {
      name: relative(layoutsDir, f).replace('.vue', ''),
      absolutePath: f,
    }
  })

  return files
}

async function scanQuery(nuxt: Nuxt, dir: string) {
  const queryDir = resolve(nuxt.options.srcDir, dir)
  return (await resolveFiles(queryDir, '*.vue')).map((f) => {
    return {
      name: relative(queryDir, f).replace('.vue', ''),
      absolutePath: f,
    }
  })
}
