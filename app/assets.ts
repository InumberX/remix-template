import { createAssetServer } from 'remix/assets'
import { uiHmr } from 'remix/ui-hmr/assets'

import { BUILD_ID, IS_DEVELOPMENT, IS_NODE_HMR } from './env.ts'

const rootDir = process.cwd()
const isHmr = IS_DEVELOPMENT && IS_NODE_HMR

export const assets = createAssetServer({
  basePath: '/assets',
  rootDir,

  allowFiles: ['app/routes.ts', 'app/**/public/**'],
  allowPackages: ['remix'],
  denyFiles: ['app/**/*.test.*'],
  sourceMaps: IS_DEVELOPMENT ? 'external' : undefined,
  minify: !IS_DEVELOPMENT,
  watch: IS_DEVELOPMENT,
  // Content-based fingerprinting: URLs gain a `.@<hash>` segment and are served
  // `public, max-age=31536000, immutable`, so a returning browser issues no
  // request at all for an unchanged module. It assumes files on disk do not
  // change, hence the `watch: false` it requires — development keeps the
  // default stable URLs with `no-cache` + ETag instead.
  //
  // Every instance must share the same BUILD_ID or they hand out different
  // URLs for the same file and split the cache.
  fingerprint: IS_DEVELOPMENT ? undefined : { buildId: BUILD_ID },
  hmr: isHmr
    ? async () => (await import('remix/node-hmr/runtime')).createBrowserHmrChannel()
    : undefined,
  scripts: { loaders: isHmr ? [uiHmr()] : undefined },
})

const entry = 'app/actions/public/entry.ts'

export const entryHref = await assets.getHref(entry)
export const entryPreloads = await assets.getPreloads(entry)
