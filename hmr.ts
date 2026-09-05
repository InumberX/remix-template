import * as http from 'node:http'
import { createFetchProxy } from 'remix/fetch-proxy'
import { createRequestListener } from 'remix/node-fetch-server'
import { createHmrReadyFetch, run } from 'remix/node-hmr'

import { APP_PORT, HMR_PORT, PORT } from './app/env.ts'

const hmrRunner = run('server.ts', {
  env: {
    // Pass the parent environment through unchanged, then override the two
    // ports the child must use. This spread is not an env *read*, so it stays.
    ...process.env,
    PORT: String(APP_PORT),
    HMR_PROXY_PORT: String(PORT),
  },
  nodeArgs: ['--import', 'remix/node-tsx', '--import', 'remix/ui-hmr/node'],
  browserHmrChannel: { port: HMR_PORT },
})

const server = http.createServer(
  createRequestListener(
    createHmrReadyFetch(
      hmrRunner,
      createFetchProxy(`http://127.0.0.1:${APP_PORT}`, {
        xForwardedHeaders: true,
      })
    )
  )
)

server.listen(PORT, '127.0.0.1')

let shuttingDown = false

const shutdown = () => {
  if (shuttingDown) return
  shuttingDown = true
  server.close(() => hmrRunner.close().finally(() => process.exit(0)))
  server.closeAllConnections()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
