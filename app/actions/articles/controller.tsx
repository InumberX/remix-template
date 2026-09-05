import { createController } from 'remix/router'

import { routes } from '../../routes.ts'
import { ArticlesIndexPage } from './index-page/index-page.tsx'
import { ArticleShowPage } from './show-page/show-page.tsx'

export default createController(routes.articles, {
  actions: {
    index(context) {
      return context.render(<ArticlesIndexPage url={context.url} />)
    },
    show(context) {
      return context.render(<ArticleShowPage id={context.params.id} url={context.url} />)
    },
  },
})
