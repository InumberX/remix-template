// The single place this app reads `process.env`. Everything else imports the
// resolved constants from here, so the set of environment variables the app
// depends on — and their defaults — is visible in one file.
//
// Modelled on auba-general-view's app/config/env.ts, widened to cover the
// runtime configuration that generalview kept in vite.config.ts.

export type NodeEnv = 'development' | 'production' | 'test'

const port = (value: string | undefined, fallback: number): number => {
  return value ? Number.parseInt(value, 10) : fallback
}

export const NODE_ENV: NodeEnv = (process.env.NODE_ENV as NodeEnv | undefined) ?? 'development'
export const IS_DEVELOPMENT = NODE_ENV === 'development'
export const IS_PRODUCTION = NODE_ENV === 'production'
export const IS_TEST = NODE_ENV === 'test'

/** Set by `remix/node-hmr` in the supervised child process. */
export const IS_NODE_HMR = Boolean(process.env.REMIX_NODE_HMR)

/** Public port. `hmr.ts` binds it for the proxy; `server.ts` binds it directly. */
export const PORT = port(process.env.PORT, 44100)

/** Set by `hmr.ts` on the child so `server.ts` logs the public URL, not its own. */
export const HMR_PROXY_PORT = process.env.HMR_PROXY_PORT
  ? Number.parseInt(process.env.HMR_PROXY_PORT, 10)
  : null

/** Browser HMR event channel. */
export const HMR_PORT = port(process.env.HMR_PORT, PORT + 1)

/** Port the supervised child server listens on behind the HMR proxy. */
export const APP_PORT = port(process.env.APP_PORT, HMR_PORT + 1)

/**
 * Set per deployment (a commit sha or a build timestamp). generalview derived
 * this from the Vite build time; here it has to come from the environment
 * because there is no build step to bake a value into. Defaults to a fixed
 * `dev` rather than a timestamp so local reloads do not refetch every asset.
 */
export const BUILD_ID = process.env.BUILD_ID ?? 'dev'

/** Absolute origin used to build canonical and og:url values. */
export const SITE_URL = (process.env.SITE_URL ?? `http://localhost:${PORT}`).replace(/\/$/, '')

/** Force `noindex, nofollow` on every page (staging). Production defaults to indexable. */
export const NO_INDEX = process.env.NO_INDEX === 'true'

/**
 * Query string, without the `?`. Matches generalview's `ver=...` shape.
 *
 * Files under the root `public/` directory are served by `staticFiles` exactly
 * as they are on disk — no content hash, and no `Cache-Control` header — so a
 * per-deploy query string is what invalidates them in browsers. Append it where
 * the URL is written, keeping the pattern in the type:
 *
 *   `/static/img/img.jpg?${CACHE_BUSTER}`  ->  `/static/img/img.jpg?${string}`
 *
 * Assets served by the asset server (`a `public/` directory`) do NOT need this: they
 * already carry content-based ETags, and `fingerprint` in app/assets.ts would
 * give them immutable URLs.
 */
export const CACHE_BUSTER = `ver=${BUILD_ID}`
