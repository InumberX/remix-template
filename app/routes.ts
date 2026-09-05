// The single source of truth for URLs. Patterns are literals so Remix can type
// `href()` arguments and `context.params` from them. This module imports nothing
// from the app, so nothing can create a cycle back into the route contract.
import { get, route } from 'remix/routes'

export const routes = route({
  assets: get('/assets/*path'),
  home: get('/'),
  articles: {
    index: get('/articles'),
    show: get('/articles/:id'),
  },
  // Development-only component gallery. Declared unconditionally so the route
  // map stays a stable type; the action returns 404 outside development.
  devUi: get('/dev/ui'),
})
