import { cop } from 'remix/middleware/cop'
import { staticFiles } from 'remix/middleware/static'
import { createRouter, type MiddlewareContext } from 'remix/router'

import articlesController from './actions/articles/controller.tsx'
import controller from './actions/controller.tsx'
import { assets } from './assets.ts'
import { IS_PRODUCTION } from './env.ts'
import { renderWithCsp } from './middleware/csp.tsx'
import { securityHeaders } from './middleware/security-headers.ts'
import { routes } from './routes.ts'

// - securityHeaders() first, so its headers land on everything below it: static
//   files, cop()'s 403, and the 500 it turns a thrown error into.
// - cop() rejects unsafe cross-origin requests (POST/PUT/PATCH/DELETE) from
//   `Sec-Fetch-Site` / `Origin`, without tokens or sessions. When sessions
//   arrive, add session() and then csrf() after it (see CLAUDE.md).
// - renderWithCsp() is csp() with render() inside it, so the renderer stamps
//   the request's nonce on everything it writes.
const securityHeadersMiddleware = securityHeaders()
const copMiddleware = cop()
const staticFilesMiddleware = staticFiles('./public', {
  index: false,
  // Root `public/` is served verbatim, so URLs never change on their own.
  // Files referenced from the app carry `?${CACHE_BUSTER}` (app/env.ts),
  // which is what invalidates them on deploy; a day of caching plus the
  // ETag revalidation keeps unreferenced files like favicon.svg correct.
  cacheControl: IS_PRODUCTION ? 'public, max-age=86400' : 'no-cache',
})
const renderMiddleware = renderWithCsp({ assets })

type AppContext = MiddlewareContext<
  [
    typeof securityHeadersMiddleware,
    typeof copMiddleware,
    typeof staticFilesMiddleware,
    typeof renderMiddleware,
  ]
>

declare module 'remix' {
  interface RouterTypes {
    context: AppContext
  }
}

export const router = createRouter<AppContext>({
  middleware: [securityHeadersMiddleware, copMiddleware, staticFilesMiddleware, renderMiddleware],
})

router.map(routes, controller)
router.map(routes.articles, articlesController)
