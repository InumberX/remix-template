// Remix route patterns are exact, so without this `/articles/` is a 404.
// Redirecting to the slash-less URL keeps old links and bookmarks working and
// leaves each page one canonical URL.
import type { Middleware } from 'remix/router'

import { HTTP_STATUS } from '../utils/http-status.ts'
import { localRedirect } from './local-redirect.ts'

/**
 * Router middleware: `/path/` is redirected to `/path`, query kept, for every
 * method. 308 rather than 301 because 308 keeps the method and body — a form
 * POSTed to `/path/` arrives at `/path` as a POST, where a 301 would turn it
 * into a GET.
 */
export const trailingSlash = (): Middleware => (context, next) => {
  const { pathname, search } = context.url
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return localRedirect(
      context.url,
      `${pathname.replace(/\/+$/, '')}${search}`,
      HTTP_STATUS.PERMANENT_REDIRECT
    )
  }
  return next()
}
