// Ported from auba-general-view: app/components/ui/layouts/LayoutInner
import { css, type Handle, type MixInput } from 'remix/ui'

import * as styles from './layout-inner.styles.ts'
import type { LayoutInnerProps } from './layout-inner.types.ts'

export type * from './layout-inner.types.ts'

/** Centres content and caps its width. `full` opts out of the cap. */
export function LayoutInner(handle: Handle<LayoutInnerProps>) {
  return () => {
    const { children, size = 'medium', styleOverrides, mix } = handle.props
    const hostStyle: MixInput<HTMLElement> = [
      css({ ...styles.layoutInner, ...styles.layoutInnerSizes[size], ...styleOverrides }),
      mix,
    ]

    return <div mix={hostStyle}>{children}</div>
  }
}
