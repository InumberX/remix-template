import * as http from 'node:http'
import { createRequestListener } from 'remix/node-fetch-server'

import { HMR_PROXY_PORT, IS_NODE_HMR, PORT } from './app/env.ts'
import { router } from './app/router.ts'

// The listener's default `onError` logs and answers a generic 500, and it
// drops errors that are only the request's own abort reason. Under `npm run
// hmr` the request arrives through the fetch proxy, so trust its forwarded
// headers there to keep `request.url` on the public origin.
const server = http.createServer(createRequestListener(router.fetch, { trustProxy: IS_NODE_HMR }))

server.listen(PORT, () => {
  if (IS_NODE_HMR) {
    import('remix/node-hmr/runtime').then((nodeHmr) => nodeHmr.emitServerReady())
  }

  console.log(`Server listening on http://localhost:${HMR_PROXY_PORT ?? PORT}`)
})

let shuttingDown = false

const shutdown = () => {
  if (shuttingDown) {
    return
  }

  shuttingDown = true
  server.close(() => process.exit(0))
  server.closeAllConnections()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
