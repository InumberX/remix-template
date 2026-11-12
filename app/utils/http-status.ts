// The HTTP statuses the app answers with, named once so a call site says what
// it means (`HTTP_STATUS.NOT_FOUND`) rather than a bare number. Imports
// nothing, so middleware and actions can both use it. Add a name when a new
// status is needed.
export const HTTP_STATUS = {
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const
