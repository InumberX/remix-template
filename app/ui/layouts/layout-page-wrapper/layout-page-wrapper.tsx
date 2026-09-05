// Ported from auba-general-view: app/components/ui/layouts/LayoutPageWrapper
//
// The `isSignIn` variant is dropped — it offsets a taller signed-in header that
// this project has no equivalent for.
import { css, type Handle, type MixInput } from 'remix/ui'

import * as styles from './layout-page-wrapper.styles.ts'
import type { LayoutPageWrapperProps } from './layout-page-wrapper.types.ts'

export type * from './layout-page-wrapper.types.ts'

/** Page body padding, offset for the fixed header. */
export function LayoutPageWrapper(handle: Handle<LayoutPageWrapperProps>) {
  return () => {
    const { children, isTopNoSpace, isBottomNoSpace, styleOverrides, mix } = handle.props
    const hostStyle: MixInput<HTMLElement> = [
      css({
        ...styles.layoutPageWrapper,
        ...(isTopNoSpace ? styles.layoutPageWrapper__topNoSpace : null),
        ...(isBottomNoSpace ? styles.layoutPageWrapper__bottomNoSpace : null),
        ...styleOverrides,
      }),
      mix,
    ]

    return <div mix={hostStyle}>{children}</div>
  }
}
