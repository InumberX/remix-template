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
          {/* The image is the heading itself, so it sits directly in the <h1>:
              `h1` takes phrasing content, and a `figure` is flow content. */}
          <h1 mix={css(styles.mainVisualTitle)}>
            <img
              src={`/static/img/img-sample-001.avif?${CACHE_BUSTER}`}
              alt="Remix 3 スターターテンプレート"
              mix={css(styles.mainVisualTitle_image)}
            />
          </h1>
        </div>
      </LayoutInner>
    </div>
  )
}
