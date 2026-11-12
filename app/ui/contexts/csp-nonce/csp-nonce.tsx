// The request's CSP nonce, handed to components through component context.
//
// Kept apart from app/middleware/csp.tsx, which installs it, so a component
// that needs the nonce does not import server middleware (and, once something
// hydrates, so it can move into a `public/` directory on its own).
import type { Handle, RemixNode } from 'remix/component'

type CspNonceContext = { nonce: string }

/**
 * Makes the request's nonce available to every component below it, so a page
 * does not have to thread it through props. `renderWithCsp()` wraps every
 * rendered page in it; read it with `useCspNonce(handle)`.
 */
export function CspNonceProvider(
  handle: Handle<{ nonce: string; children?: RemixNode }, CspNonceContext>
) {
  handle.context.set({ nonce: handle.props.nonce })
  return () => handle.props.children
}

/**
 * The nonce for scripts this component renders, or `undefined` outside a
 * request (a component rendered on its own in a test, `/dev/ui` specimens).
 * Call it in setup, like any context read.
 */
export const useCspNonce = (handle: Handle<object>): string | undefined =>
  handle.context.get(CspNonceProvider)?.nonce
