import { run } from 'remix/component'
import {
  detectMultipleImportMapSupport,
  importModule,
  preloadShim,
} from 'remix/multiple-import-maps-polyfill'

// Client entries discovered after the first paint can bring their own import
// maps. `importModule` and `preloadShim` resolve through every map in the
// document on browsers that do not support multiple import maps natively.
// Frames use the runtime's default `resolveFrame`.
const app = run({
  async loadModule(moduleUrl, exportName) {
    const mod = await importModule(moduleUrl)
    const Component = mod[exportName]
    if (typeof Component !== 'function') {
      throw new Error(`Unknown component: ${moduleUrl}#${exportName}`)
    }
    return Component
  },
  async processClientEntryPreloads(preloads) {
    if (await detectMultipleImportMapSupport()) return preloads

    preloadShim(preloads)
    return []
  },
})

if (import.meta.hot) {
  import.meta.hot.on('server:update', async () => {
    try {
      await app.ready()
      await app.frames.top.reload()
    } catch (error) {
      console.error('Error reloading top frame on server update', error)
    }
  })
}
