// Ported from auba-general-view: app/utils/meta.ts (`getMetadata`).
//
// React Router collects `MetaDescriptor[]` and renders them for you. Remix 3
// has no meta API — `Document` owns `<head>` — so this returns the tags
// themselves, and `Document` places them. The site-wide defaults live here; a
// page overrides only what differs.
import type { RemixNode } from 'remix/component'

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
  /** `null` for a page that has no canonical of its own (an error page): no canonical, no og:url. */
  canonical?: string | null
  ogImage?: string
  ogType?: OgType
  twitterCard?: TwitterCard
  robots?: RobotsDirective
  prev?: string
  next?: string
  siteName?: string
}

/**
 * Resolves a URL against `SITE_URL` the way a browser resolves an `href`: an
 * absolute URL passes through, `//host/x` takes the site's scheme, and a path
 * with or without its leading slash lands under the site. Prefixing the string
 * instead made `https://site//host/x` and `https://sitex`.
 */
export const absoluteUrl = (pathOrUrl: string): string => {
  try {
    const url = new URL(pathOrUrl, `${SITE_URL}/`)
    // Only a web address belongs in a canonical or og:image; a `javascript:`
    // or `data:` value (from a CMS, say) becomes the site's own root instead.
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : `${SITE_URL}/`
  } catch {
    // A value no browser could resolve either. Rendering streams, so a throw
    // here would cut the page off mid-way rather than become a 500; it becomes
    // the site's root, like any other non-address.
    return `${SITE_URL}/`
  }
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
  const canonicalUrl =
    meta.canonical === null ? undefined : meta.canonical ? absoluteUrl(meta.canonical) : currentUrl
  const ogUrl = meta.canonical === null ? undefined : currentUrl
  const ogImageUrl = absoluteUrl(meta.ogImage ?? DEFAULT_OG_IMAGE)

  // Anything but production is kept out of the index, matching generalview.
  const robotsContent = !IS_PRODUCTION || NO_INDEX ? 'noindex, nofollow' : robots

  return (
    <>
      <meta name="description" content={description} />
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogUrl ? <meta property="og:url" content={ogUrl} /> : null}
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
