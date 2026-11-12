// Content-Security-Policy with a per-request nonce, on Remix's own `csp()`.
//
// `csp()` establishes the nonce and sends the policy; `render()`, which runs
// inside it, stamps that nonce on everything the renderer writes itself — the
// `<style data-rmx-style>` tags `css(...)` emits and the client entries' import
// maps and preloads — so `style-src` needs no `'unsafe-inline'`. A
// server-rendered `<Frame src>` resolves through an internal request that
// inherits the same nonce. For the tags `Document` writes itself (the import
// map, the preloads and the script entry), `renderWithCsp()` also wraps every
// page in `CspNonceProvider`, and components read the nonce back through
// component context (app/ui/contexts/csp-nonce/): a component has no request
// context of its own to call `getCspNonce()` with.
import { csp, type CspNonce, getCspNonce } from 'remix/middleware/csp'
import { render, Renderer, type RenderFunction, type RenderOptions } from 'remix/middleware/render'
import type { Middleware } from 'remix/router'

import { HMR_PORT, IS_NODE_HMR } from '../env.ts'
import { CspNonceProvider } from '../ui/contexts/csp-nonce/csp-nonce.tsx'
import { mediaTypeOf } from './with-headers.ts'

const NONCE_PLACEHOLDER = '{{nonce}}'

/**
 * Under `npm run hmr` the browser listens for updates on an event stream that
 * `hmr.ts` serves on its own port (remix/node-hmr binds it to 127.0.0.1).
 */
const HMR_SOURCES = IS_NODE_HMR ? [`http://127.0.0.1:${HMR_PORT}`] : []

/**
 * Same-origin only, plus the nonce. Add an origin here when the app starts
 * loading from one (a font host, an analytics tag, an API it calls from the
 * browser). `'strict-dynamic'` lets a nonce'd script load the modules it
 * imports; browsers that support it ignore `'self'` in `script-src`, which
 * stays for older ones.
 */
const DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': ["'self'", `'nonce-${NONCE_PLACEHOLDER}'`, "'strict-dynamic'"],
  // The nonce covers the <style> tags render() writes; nothing renders a
  // `style` attribute, which no nonce can cover.
  'style-src': ["'self'", `'nonce-${NONCE_PLACEHOLDER}'`],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'", ...HMR_SOURCES],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
}

// Everything but the nonce is fixed for the life of the process, so the policy
// is joined once and only the nonce is substituted per request — every
// occurrence, since script-src and style-src both carry it.
const POLICY_TEMPLATE = Object.entries(DIRECTIVES)
  .map(([name, sources]) => `${name} ${sources.join(' ')}`)
  .join('; ')

export const buildCspDirective = (nonce: string): string =>
  POLICY_TEMPLATE.replaceAll(NONCE_PLACEHOLDER, nonce)

/**
 * Only `text/html` without a policy of its own gets the nonce policy: a nonce
 * means nothing on a 404 in plain text, a redirect or a module from the asset
 * server, and a route that sets its own CSP keeps it alone — `csp()` would
 * otherwise add its policy beside the route's, and the browser enforces both.
 * Everything else gets securityHeaders()'s fallback.
 */
const takesNoncePolicy = (response: Response): boolean =>
  mediaTypeOf(response) === 'text/html' && !response.headers.has('Content-Security-Policy')

/**
 * `csp()` and `render()` as one middleware, so `render()` always runs inside
 * the `csp()` whose nonce it stamps — there is no middleware order to get
 * wrong. The renderer is then replaced with one that wraps every page in
 * `CspNonceProvider`, for the tags `Document` writes itself.
 */
export const renderWithCsp = (
  options?: RenderOptions
): Middleware<
  readonly [
    { key: typeof CspNonce; value: string },
    { key: typeof Renderer; value: RenderFunction; property: 'render' },
  ]
> => {
  const cspMiddleware = csp({
    policy: ({ nonce }) => buildCspDirective(nonce),
    filter: takesNoncePolicy,
  })
  const renderMiddleware = render(options)

  return (context, next) =>
    cspMiddleware(context, async () =>
      renderMiddleware(context, async () => {
        // csp() above established it, and render() read the same one, so a
        // missing nonce is a wiring bug: fail loudly rather than ship scripts
        // the policy blocks.
        const nonce = getCspNonce(context)
        if (nonce === undefined) throw new Error('renderWithCsp(): csp() set no nonce')
        // AnyRenderer is all the key's type says; render() above is what put a
        // RenderFunction there, so the cast restates what this function owns.
        const renderPage = context.get(Renderer) as RenderFunction
        const renderWithNonce: RenderFunction = (node, init) =>
          renderPage(<CspNonceProvider nonce={nonce}>{node}</CspNonceProvider>, init)
        // Same key and property as render() used, so this replaces the renderer
        // rather than adding a second one; `context.render` now returns this.
        context.set(Renderer, renderWithNonce, { property: 'render' })
        return next()
      })
    )
}
