import type { Handle } from 'remix/ui'

import { routes } from '../../../routes.ts'
import { LayoutInner } from '../../../ui/layouts/layout-inner/layout-inner.tsx'
import { LayoutMain } from '../../../ui/layouts/layout-main/layout-main.tsx'
import { LayoutPageWrapper } from '../../../ui/layouts/layout-page-wrapper/layout-page-wrapper.tsx'
import { PrimitiveButton } from '../../../ui/primitives/buttons/primitive-button/primitive-button.tsx'
import { Document } from '../../document.tsx'

const PAGE_TITLE = '記事一覧'

export type ArticlesIndexPageProps = {
  url: URL
}

export function ArticlesIndexPage(handle: Handle<ArticlesIndexPageProps>) {
  return () => (
    <Document
      url={handle.props.url}
      meta={{ title: PAGE_TITLE, description: '公開中の記事の一覧です。' }}
    >
      <LayoutPageWrapper>
        <LayoutMain>
          <LayoutInner>
            <h1>{PAGE_TITLE}</h1>
            <ul>
              <li>
                <PrimitiveButton url={routes.home.href()}>トップページへ</PrimitiveButton>
              </li>
              <li>
                <PrimitiveButton url={routes.articles.show.href({ id: '1' })}>
                  記事1
                </PrimitiveButton>
              </li>
            </ul>
          </LayoutInner>
        </LayoutMain>
      </LayoutPageWrapper>
    </Document>
  )
}
