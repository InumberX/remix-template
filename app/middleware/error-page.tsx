// Every error the app answers in plain text — a route's 404, the router's own
// 404 for a path nothing matches, its 405 — leaves through here and becomes the
// site's error page, with the same status and headers (an `Allow` stays). One
// place, so every 404 looks the same however it was reached.
//
// Router middleware, after renderWithCsp(): it needs the renderer that sets up,
// and the page it renders goes back out through it to get its CSP. What fails
// before the renderer — cop()'s 403, a thrown error's 500 — stays plain text,
// as does a response that names a type of its own.
import { Renderer, type RenderFunction } from 'remix/middleware/render'
import type { Middleware } from 'remix/router'

import { ErrorPage } from '../actions/error-page.tsx'
import { HTTP_STATUS } from '../utils/http-status.ts'
import { appendHeader, mediaTypeOf } from './with-headers.ts'

/** No content type, or plain text: what this app's error responses carry. */
const isPlain = (response: Response): boolean => {
  const type = mediaTypeOf(response)
  return type === null || type === 'text/plain'
}

/**
 * Headers the error page sets for itself: its type and length, and its CSP —
 * a policy carried over from the plain response (a `default-src 'none'`, say)
 * would stop renderWithCsp() from adding the nonce one, and block the page's
 * own scripts.
 */
const OWN_HEADERS = new Set(['content-type', 'content-length', 'content-security-policy'])

/**
 * The files the app serves: root `public/` and the asset server's modules
 * (`.ts`/`.tsx` under `/assets/`). A request for one that is missing gets the
 * plain error, not a whole page it cannot use. Named rather than "anything
 * with a dot", so a page URL with a dot in it still gets the page.
 */
const FILE = /\.(?:js|mjs|ts|tsx|css|map|json|xml|txt|png|jpe?g|gif|webp|avif|svg|ico|woff2?)$/i

const isFileRequest = (url: URL): boolean => FILE.test(url.pathname)

/** A browser navigating says `text/html`; a module or an image does not. */
const acceptsHtml = (request: Request): boolean =>
  (request.headers.get('Accept') ?? '').includes('text/html')

export const errorPage = (): Middleware => async (context, next) => {
  const response = await next()
  if (response.status < HTTP_STATUS.BAD_REQUEST || !isPlain(response)) return response
  // For a file, the answer depends on `Accept`; say so to any cache between.
  const isFile = isFileRequest(context.url)
  if (isFile && !acceptsHtml(context.request)) {
    // Appended, like the page's below: a `Vary` the response already has stays.
    return appendHeader(response, 'Vary', 'Accept')
  }
  // The plain body is replaced, never read; release it.
  await response.body?.cancel().catch(() => {})

  const render = context.get(Renderer) as RenderFunction
  const page = await render(<ErrorPage url={context.url} status={response.status} />, {
    status: response.status,
  })
  // Keep what the error said besides its body: `Allow` on a 405, say.
  // The error's own headers win over the page's (an `Allow`, a `Cache-Control`
  // it chose); `Set-Cookie` is appended, as it may repeat and `set` would keep
  // only the last.
  response.headers.forEach((value, name) => {
    if (OWN_HEADERS.has(name.toLowerCase())) return
    if (name.toLowerCase() === 'set-cookie') return
    page.headers.set(name, value)
  })
  for (const cookie of response.headers.getSetCookie()) page.headers.append('Set-Cookie', cookie)
  if (isFile) page.headers.append('Vary', 'Accept')
  return page
}
