// Response hardening that does not depend on the page. The
// Content-Security-Policy, which needs the per-request nonce, is csp.tsx's.
import type { Middleware } from 'remix/router'

import { IS_PRODUCTION } from '../env.ts'
import { internalServerError } from './internal-server-error.ts'
import { withHeaders } from './with-headers.ts'

/** Sent on every router response. */
const ALWAYS = {
  'X-Content-Type-Options': 'nosniff',
  // Kept next to CSP `frame-ancestors 'none'` for browsers that predate it.
  'X-Frame-Options': 'DENY',
} as const

/**
 * Production only: HSTS on `localhost` would pin the browser to HTTPS for every
 * local port for two years.
 *
 * This host only. `includeSubDomains` would pin every subdomain of the domain
 * the app is served from to HTTPS as well, and `preload` asks to be put on the
 * browsers' built-in list, which takes months to leave. Both are a decision
 * about the whole domain, so a project adds them once it has made it.
 */
const PRODUCTION_ONLY = {
  'Strict-Transport-Security': 'max-age=63072000',
} as const

/**
 * The policy for any response that does not carry one — cop()'s 403, the 500
 * below, a plain-text 404, a redirect, a static file. Nothing in those may load
 * or frame anything. HTML pages get renderWithCsp()'s nonce policy instead.
 */
export const FALLBACK_CSP = "default-src 'none'; frame-ancestors 'none'"

export type SecurityHeadersOptions = {
  /** Whether to add `PRODUCTION_ONLY`. Defaults to `IS_PRODUCTION`; tests pass it. */
  production?: boolean
}

/**
 * Adds the static security headers to every response the router produces:
 * static files, rejections from the middleware after it (`cop()`'s 403), and
 * the generic 500 for anything that throws, so an error response is never less
 * protected than a page. That makes this the router's error boundary. A
 * response without a CSP of its own gets `FALLBACK_CSP`.
 *
 * A header the response already carries is kept, for every header here alike:
 * a route that sets its own policy (a CSP with `frame-ancestors` and the
 * matching `X-Frame-Options`, say) has decided on it, and replacing half of a
 * pair would contradict the other half.
 */
export const securityHeaders = ({
  production = IS_PRODUCTION,
}: SecurityHeadersOptions = {}): Middleware => {
  const headers = Object.entries({
    ...ALWAYS,
    ...(production ? PRODUCTION_ONLY : {}),
    'Content-Security-Policy': FALLBACK_CSP,
  })

  return async (_context, next) => {
    let response: Response
    try {
      response = await next()
    } catch (error) {
      response = internalServerError(error)
    }
    return withHeaders(
      response,
      Object.fromEntries(headers.filter(([name]) => !response.headers.has(name)))
    )
  }
}
