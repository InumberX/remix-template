/**
 * The response's media type, lower-cased and without parameters
 * (`text/html; charset=UTF-8` is `text/html`), or `null` without one. The same
 * parse as `isHtmlResponse()` in @remix-run/render-middleware's render-ui.ts,
 * which is not exported; keep the two in step when Remix is upgraded.
 */
export const mediaTypeOf = (response: Response): string | null => {
  const type = response.headers.get('Content-Type')
  return type === null ? null : (type.split(';', 1)[0] ?? '').trim().toLowerCase()
}

/**
 * Sets headers on a response, copying it first when its headers are immutable
 * (`Response.redirect()` and some fetched responses throw on `set`).
 */
export const withHeaders = (response: Response, headers: Record<string, string>): Response =>
  editHeaders(response, (target) => {
    for (const [name, value] of Object.entries(headers)) target.set(name, value)
  })

/** Appends a header value, keeping any the response already has (`Vary`). */
export const appendHeader = (response: Response, name: string, value: string): Response =>
  editHeaders(response, (target) => target.append(name, value))

const editHeaders = (response: Response, edit: (headers: Headers) => void): Response => {
  try {
    edit(response.headers)
    return response
  } catch {
    const copy = new Response(response.body, response)
    edit(copy.headers)
    return copy
  }
}
