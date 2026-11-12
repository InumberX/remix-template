import { cop } from 'remix/middleware/cop'
import { staticFiles } from 'remix/middleware/static'
import { createRouter, type MiddlewareContext } from 'remix/router'

import articlesController from './actions/articles/controller.tsx'
import controller from './actions/controller.tsx'
import { assets } from './assets.ts'
import { IS_PRODUCTION } from './env.ts'
import { renderWithCsp } from './middleware/csp.tsx'
import { errorPage } from './middleware/error-page.tsx'
import { securityHeaders } from './middleware/security-headers.ts'
import { trailingSlash } from './middleware/trailing-slash.ts'
import { routes } from './routes.ts'

// - securityHeaders() first, so its headers land on everything below it: static
//   files, cop()'s 403, and the 500 it turns a thrown error into.
// - cop() rejects unsafe cross-origin requests (POST/PUT/PATCH/DELETE) from
//   `Sec-Fetch-Site` / `Origin`, without tokens or sessions. When sessions
//   arrive, add session() and then csrf() after it (see CLAUDE.md).
// - trailingSlash() redirects `/articles/` to `/articles` before matching:
//   route patterns are exact.
// - renderWithCsp() is csp() with render() inside it, so the renderer stamps
//   the request's nonce on everything it writes.
// - errorPage() last, inside the renderer: it turns every plain-text error
//   below it into the site's error page, which then gets its CSP on the way
//   out through renderWithCsp().
const securityHeadersMiddleware = securityHeaders()
const copMiddleware = cop()
const trailingSlashMiddleware = trailingSlash()
const staticFilesMiddleware = staticFiles('./public', {
  index: false,
  // Root `public/` is served verbatim, so URLs never change on their own.
  // Files referenced from the app carry `?${CACHE_BUSTER}` (app/env.ts),
  // which is what invalidates them on deploy; a day of caching plus the
  // ETag revalidation keeps unreferenced files like favicon.svg correct.
  cacheControl: IS_PRODUCTION ? 'public, max-age=86400' : 'no-cache',
})
const renderMiddleware = renderWithCsp({ assets })
const errorPageMiddleware = errorPage()

type AppContext = MiddlewareContext<
  [
    typeof securityHeadersMiddleware,
    typeof copMiddleware,
    typeof trailingSlashMiddleware,
    typeof staticFilesMiddleware,
    typeof renderMiddleware,
    typeof errorPageMiddleware,
  ]
>

declare module 'remix' {
  interface RouterTypes {
    context: AppContext
  }
}

export const router = createRouter<AppContext>({
  middleware: [
    securityHeadersMiddleware,
    copMiddleware,
    trailingSlashMiddleware,
    staticFilesMiddleware,
    renderMiddleware,
    errorPageMiddleware,
  ],
})

router.map(routes, controller)
router.map(routes.articles, articlesController)
