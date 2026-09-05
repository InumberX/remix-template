import { css } from 'remix/ui'

import { CACHE_BUSTER } from '../../../../env.ts'
import { LayoutInner } from '../../../../ui/layouts/layout-inner/layout-inner.tsx'
import * as styles from './main-visual.styles.ts'

/**
 * Page-local: only the home page renders it, so it stays inside the page
 * directory rather than moving to `app/ui/`.
 *
 * The image lives in root `public/`, which `staticFiles` serves with no
 * `Cache-Control`, hence the cache buster on the URL.
 */
export function MainVisual() {
  return () => (
    <div mix={css(styles.mainVisual)}>
      <LayoutInner>
        <div mix={css(styles.mainVisual_container)}>
          <h1 mix={css(styles.mainVisualTitle)}>
            <figure mix={css(styles.mainVisualTitle_container)}>
              <img
                src={`/static/img/img-sample-001.avif?${CACHE_BUSTER}`}
                alt="Main Visual"
                mix={css(styles.mainVisualTitle_image)}
              />
            </figure>
          </h1>
        </div>
      </LayoutInner>
    </div>
  )
}
