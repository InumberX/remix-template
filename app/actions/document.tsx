import type { Handle, RemixNode } from 'remix/ui'

import { entryHref, entryPreloads } from '../assets.ts'
import { CACHE_BUSTER } from '../env.ts'
import { LayoutWrapper } from '../ui/layouts/layout-wrapper/layout-wrapper.tsx'
import { type PageMeta, renderMeta, resolveTitle } from './meta.tsx'

export type DocumentProps = {
  children?: RemixNode
  /** Extra head content this page needs beyond the standard metadata. */
  head?: RemixNode
  /**
   * Site-wide metadata with per-page overrides. `url` comes from
   * `context.url` in the action, since a component has no request of its own.
   */
  meta?: PageMeta
  url?: URL
}

export function Document(handle: Handle<DocumentProps>) {
  return () => {
    const { children, head, meta = {}, url } = handle.props

    return (
      <html lang="ja">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light dark" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          {/* Declares the `@layer reset, lib, base, rmx, util` order before any
              css(...) rule lands. Root public/ URLs never change on their own,
              hence the cache buster. */}
          <link rel="stylesheet" href={`/static/css/app.css?${CACHE_BUSTER}`} />
          <title>{resolveTitle(meta)}</title>
          {url ? renderMeta(meta, url) : null}
          {head}
          {entryPreloads.map((href) => (
            <link key={href} rel="modulepreload" href={href} />
          ))}
          <script type="module" src={entryHref}></script>
        </head>
        <body>
          <LayoutWrapper>{children}</LayoutWrapper>
        </body>
      </html>
    )
  }
}
