import { HTTP_STATUS } from '../utils/http-status.ts'

/**
 * The generic 500 for an error nothing else handled: logged, never echoed to
 * the client. securityHeaders() answers with it for anything that throws inside
 * the router, so the error response still carries the security headers.
 */
export const internalServerError = (error: unknown): Response => {
  console.error(error)
  return new Response('Internal Server Error', {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
  })
}
