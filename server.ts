import * as http from 'node:http'
import { createRequestListener } from 'remix/node-fetch-server'

import { HMR_PROXY_PORT, IS_NODE_HMR, PORT } from './app/env.ts'
import { router } from './app/router.ts'

const server = http.createServer(
  createRequestListener(async (request) => {
    try {
      return await router.fetch(request)
    } catch (error) {
      if (!(request.signal.aborted && error === request.signal.reason)) {
        console.error(error)
      }
      return new Response('Internal Server Error', { status: 500 })
    }
  })
)

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
