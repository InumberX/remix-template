import { createController } from 'remix/router'

import { routes } from '../../routes.ts'
import { ArticlesIndexPage } from './index-page/index-page.tsx'
import { ArticleShowPage } from './show-page/show-page.tsx'

/**
 * Stands in for the lookup a real implementation does against its data layer.
 * The point it demonstrates is the 404: a route parameter is arbitrary user
 * input, so `show` has to answer for ids that do not resolve. Without this the
 * page would render `/articles/<anything>` as a 200 and self-canonicalise it.
 */
const ARTICLE_IDS = new Set(['1'])

export default createController(routes.articles, {
  actions: {
    index(context) {
      return context.render(<ArticlesIndexPage url={context.url} />)
    },
    show(context) {
      const { id } = context.params

      if (!ARTICLE_IDS.has(id)) {
        return new Response('Not Found', { status: 404 })
      }

      return context.render(<ArticleShowPage id={id} url={context.url} />)
    },
  },
})
