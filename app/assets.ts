import { createAssetServer } from 'remix/assets'
import { componentHmr } from 'remix/component-hmr/assets'

import { IS_DEVELOPMENT, IS_NODE_HMR, IS_PRODUCTION } from './env.ts'

const rootDir = process.cwd()
const isHmr = IS_DEVELOPMENT && IS_NODE_HMR

export const assets = createAssetServer({
  basePath: '/assets',
  rootDir,

  allowFiles: ['app/routes.ts', 'app/**/public/**'],
  allowPackages: ['remix'],
  denyFiles: ['app/**/*.test.*'],
  sourceMaps: IS_DEVELOPMENT ? 'external' : undefined,
  minify: IS_PRODUCTION,
  watch: IS_DEVELOPMENT,
  // Content-based fingerprinting: URLs gain a `.@<hash>` segment and are served
  // `public, max-age=31536000, immutable`, so a returning browser issues no
  // request at all for an unchanged module. The hash comes from the emitted
  // module alone, so an unchanged file keeps its URL across deploys and every
  // instance agrees on it without sharing any id. It assumes files on disk do
  // not change, hence the `watch: false` it requires — development keeps the
  // default stable URLs with `no-cache` + ETag instead.
  fingerprint: IS_PRODUCTION,
  hmr: isHmr
    ? {
        channel: async () => (await import('remix/node-hmr/runtime')).createBrowserHmrChannel(),
        moduleImporter: 'remix/multiple-import-maps-polyfill',
      }
    : undefined,
  scripts: { loaders: isHmr ? [componentHmr()] : undefined },
})

const entry = 'app/actions/public/entry.ts'

export const scriptEntry = await assets.getScriptEntry(entry)
