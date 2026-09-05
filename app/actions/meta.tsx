// Ported from auba-general-view: app/utils/meta.ts (`getMetadata`).
//
// React Router collects `MetaDescriptor[]` and renders them for you. Remix 3
// has no meta API — `Document` owns `<head>` — so this returns the tags
// themselves, and `Document` places them. The site-wide defaults live here; a
// page overrides only what differs.
import type { RemixNode } from 'remix/ui'

import { IS_PRODUCTION, NO_INDEX, SITE_URL } from '../env.ts'

export const SITE_NAME = 'Remix 3'
export const BASE_TITLE = 'Remix 3'
export const BASE_DESCRIPTION = 'A Remix 3 application.'
export const DEFAULT_OG_IMAGE = '/static/img/img-ogp.jpg'

export type OgType = 'website' | 'article'
export type TwitterCard = 'summary_large_image' | 'summary' | 'player' | 'app'
export type RobotsDirective = 'noindex' | 'nofollow' | 'noindex, nofollow'

export type PageMeta = {
  /** Page title. Rendered as `<title> | SITE_NAME`; omit for the site's base title. */
  title?: string
  description?: string
  /** Absolute URL, or a path resolved against `SITE_URL`. Defaults to the current URL. */
  canonical?: string
  ogImage?: string
  ogType?: OgType
  twitterCard?: TwitterCard
  robots?: RobotsDirective
  prev?: string
  next?: string
  siteName?: string
}

/** Resolves a path against `SITE_URL`; absolute inputs pass through unchanged. */
export const absoluteUrl = (pathOrUrl: string): string => {
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl}`
}

export const resolveTitle = (meta: PageMeta): string => {
  const siteName = meta.siteName ?? SITE_NAME
  return meta.title ? `${meta.title} | ${siteName}` : BASE_TITLE
}

/**
 * Every non-title head tag for a page. `Document` renders `<title>` itself from
 * `resolveTitle`, so it is deliberately absent here — two `<title>` elements
 * would otherwise be emitted.
 */
export const renderMeta = (meta: PageMeta, url: URL): RemixNode => {
  const {
    description = BASE_DESCRIPTION,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    robots,
    prev,
    next,
  } = meta

  const siteName = meta.siteName ?? SITE_NAME
  const title = resolveTitle(meta)
  const currentUrl = `${SITE_URL}${url.pathname}`
  const canonicalUrl = meta.canonical ? absoluteUrl(meta.canonical) : currentUrl
  const ogImageUrl = absoluteUrl(meta.ogImage ?? DEFAULT_OG_IMAGE)

  // Anything but production is kept out of the index, matching generalview.
  const robotsContent = !IS_PRODUCTION || NO_INDEX ? 'noindex, nofollow' : robots

  return (
    <>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:type" content={ogType} />

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {robotsContent ? <meta name="robots" content={robotsContent} /> : null}
      {prev ? <link rel="prev" href={absoluteUrl(prev)} /> : null}
      {next ? <link rel="next" href={absoluteUrl(next)} /> : null}
    </>
  )
}
