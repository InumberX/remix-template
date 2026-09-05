import type { Handle } from 'remix/ui'

import { routes } from '../../../routes.ts'
import { LayoutInner } from '../../../ui/layouts/layout-inner/layout-inner.tsx'
import { LayoutMain } from '../../../ui/layouts/layout-main/layout-main.tsx'
import { LayoutPageWrapper } from '../../../ui/layouts/layout-page-wrapper/layout-page-wrapper.tsx'
import { PrimitiveButton } from '../../../ui/primitives/buttons/primitive-button/primitive-button.tsx'
import { Document } from '../../document.tsx'

const PAGE_TITLE = '記事'

export type ArticleShowPageProps = {
  id: string
  url: URL
}

export function ArticleShowPage(handle: Handle<ArticleShowPageProps>) {
  return () => {
    const { id, url } = handle.props

    return (
      <Document
        url={url}
        meta={{
          title: `${PAGE_TITLE} ${id}`,
          description: `記事 ${id} の詳細です。`,
          ogType: 'article',
        }}
      >
        <LayoutPageWrapper>
          <LayoutMain>
            <LayoutInner>
              <h1>
                {PAGE_TITLE} {id}
              </h1>
              <ul>
                <li>
                  <PrimitiveButton url={routes.home.href()}>トップページへ</PrimitiveButton>
                </li>
                <li>
                  <PrimitiveButton url={routes.articles.index.href()}>記事一覧へ</PrimitiveButton>
                </li>
              </ul>
            </LayoutInner>
          </LayoutMain>
        </LayoutPageWrapper>
      </Document>
    )
  }
}
