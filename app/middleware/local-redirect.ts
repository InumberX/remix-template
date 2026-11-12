import { createRedirectResponse } from 'remix/response/redirect'

/**
 * A redirect to `path` on this site. The target is resolved against the
 * request's origin, and anything that would leave it — `//host/…` from a
 * doubled slash, say — becomes `/` instead. The Location stays root-relative.
 */
export const localRedirect = (url: URL, path: string, status: number): Response => {
  const target = new URL(path, url.origin)
  return createRedirectResponse(
    target.origin === url.origin ? `${target.pathname}${target.search}` : '/',
    status
  )
}
