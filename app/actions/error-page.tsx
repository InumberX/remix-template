// The page every route answers an error with. It is not a route of its own —
// app/middleware/error-page.tsx renders it in place of any plain-text error
// response — so it sits beside document.tsx rather than in a `-page`
// directory, which names a route key.
import type { Handle } from 'remix/component'

import { routes } from '../routes.ts'
import { LayoutInner } from '../ui/layouts/layout-inner/layout-inner.tsx'
import { LayoutMain } from '../ui/layouts/layout-main/layout-main.tsx'
import { LayoutPageWrapper } from '../ui/layouts/layout-page-wrapper/layout-page-wrapper.tsx'
import { PrimitiveButton } from '../ui/primitives/buttons/primitive-button/primitive-button.tsx'
import { HTTP_STATUS } from '../utils/http-status.ts'
import { Document } from './document.tsx'

export type ErrorPageProps = {
  url: URL
  status: number
}

const MESSAGES = {
  notFoundTitle: 'ページが見つかりません',
  notFoundDescription: 'お探しのページは、移動または削除された可能性があります。',
  errorTitle: 'エラーが発生しました',
  errorDescription: '時間をおいて、もう一度お試しください。',
  rejectedDescription: 'このページを表示できませんでした。',
  backToHome: 'トップページへ',
} as const

/**
 * A 404 or 410 is a page that is not there; any other 4xx (a 405 for a POST
 * to a page that exists, say) is a request the page refused, and a 5xx is
 * ours — "try again later" is only true of that one.
 */
const isNotFound = (status: number) =>
  status === HTTP_STATUS.NOT_FOUND || status === HTTP_STATUS.GONE

export function ErrorPage(handle: Handle<ErrorPageProps>) {
  return () => {
    const { url, status } = handle.props
    const notFound = isNotFound(status)
    const title = notFound ? MESSAGES.notFoundTitle : MESSAGES.errorTitle
    const description = notFound
      ? MESSAGES.notFoundDescription
      : status >= HTTP_STATUS.INTERNAL_SERVER_ERROR
        ? MESSAGES.errorDescription
        : MESSAGES.rejectedDescription

    // No canonical: an error at /articles?page=0 must not name /articles, a
    // live page, as the URL it stands for.
    return (
      <Document url={url} meta={{ title, robots: 'noindex, nofollow', canonical: null }}>
        <LayoutPageWrapper>
          <LayoutMain>
            <LayoutInner>
              <h1>{title}</h1>
              <p>{description}</p>
              <PrimitiveButton url={routes.home.href()}>{MESSAGES.backToHome}</PrimitiveButton>
            </LayoutInner>
          </LayoutMain>
        </LayoutPageWrapper>
      </Document>
    )
  }
}
