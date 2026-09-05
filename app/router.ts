import { render } from 'remix/middleware/render'
import { staticFiles } from 'remix/middleware/static'
import { createRouter, type MiddlewareContext } from 'remix/router'

import articlesController from './actions/articles/controller.tsx'
import controller from './actions/controller.tsx'
import { assets } from './assets.ts'
import { IS_PRODUCTION } from './env.ts'
import { routes } from './routes.ts'

const renderMiddleware = render({ assets })
type AppContext = MiddlewareContext<[typeof renderMiddleware]>

declare module 'remix/router' {
  interface RouterTypes {
    context: AppContext
  }
}

export const router = createRouter<AppContext>({
  middleware: [
    staticFiles('./public', {
      index: false,
      // Root `public/` is served verbatim, so URLs never change on their own.
      // Files referenced from the app carry `?${CACHE_BUSTER}` (app/env.ts),
      // which is what invalidates them on deploy; a day of caching plus the
      // ETag revalidation keeps unreferenced files like favicon.svg correct.
      cacheControl: IS_PRODUCTION ? 'public, max-age=86400' : 'no-cache',
    }),
    renderMiddleware,
  ],
})

router.map(routes, controller)
router.map(routes.articles, articlesController)
