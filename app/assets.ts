import { createAssetServer } from 'remix/assets'
import { uiHmr } from 'remix/ui-hmr/assets'

import { BUILD_ID, IS_DEVELOPMENT, IS_NODE_HMR } from './env.ts'

const rootDir = process.cwd()
const isDevelopment = IS_DEVELOPMENT
const isHmr = isDevelopment && IS_NODE_HMR

export const assets = createAssetServer({
  basePath: '/assets',
  rootDir,

  allowFiles: ['app/routes.ts', 'app/**/public/**'],
  allowPackages: ['remix'],
  denyFiles: ['app/**/*.test.*'],
  sourceMaps: isDevelopment ? 'external' : undefined,
  minify: !isDevelopment,
  watch: isDevelopment,
  // Content-based fingerprinting: URLs gain a `.@<hash>` segment and are served
  // `public, max-age=31536000, immutable`, so a returning browser issues no
  // request at all for an unchanged module. It assumes files on disk do not
  // change, hence the `watch: false` it requires — development keeps the
  // default stable URLs with `no-cache` + ETag instead.
  //
  // Every instance must share the same BUILD_ID or they hand out different
  // URLs for the same file and split the cache.
  fingerprint: isDevelopment ? undefined : { buildId: BUILD_ID },
  hmr: isHmr
    ? async () => (await import('remix/node-hmr/runtime')).createBrowserHmrChannel()
    : undefined,
  scripts: { loaders: isHmr ? [uiHmr()] : undefined },
})

const entry = 'app/actions/public/entry.ts'

export const entryHref = await assets.getHref(entry)
export const entryPreloads = await assets.getPreloads(entry)
