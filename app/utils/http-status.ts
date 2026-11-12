// The HTTP statuses the app answers with, named once so a call site says what
// it means (`HTTP_STATUS.NOT_FOUND`) rather than a bare number. Imports
// nothing, so middleware and actions can both use it. Add a name when a new
// status is needed.
export const HTTP_STATUS = {
  /** A permanent redirect that keeps the method and body (trailing slashes). */
  PERMANENT_REDIRECT: 308,
  /** The first error status; anything below it is not an error. */
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  GONE: 410,
  /** The first server error status. */
  INTERNAL_SERVER_ERROR: 500,
} as const
