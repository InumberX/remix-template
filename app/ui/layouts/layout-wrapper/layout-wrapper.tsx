// Ported from auba-general-view: app/components/ui/layouts/LayoutWrapper
//
// The decorative background layers and the `isPartner` / `isGlobalMode`
// variants are dropped: they exist to brand the AUBA partner and global sites
// and reference images this project does not ship.
import { css, type Handle, type MixInput } from 'remix/ui'

import * as styles from './layout-wrapper.styles.ts'
import type { LayoutWrapperProps } from './layout-wrapper.types.ts'

export type * from './layout-wrapper.types.ts'

/** Outermost page shell: a full-height column the footer can be pushed to. */
export function LayoutWrapper(handle: Handle<LayoutWrapperProps>) {
  return () => {
    const { children, styleOverrides, mix } = handle.props
    const hostStyle: MixInput<HTMLElement> = [
      css({ ...styles.layoutWrapper, ...styleOverrides }),
      mix,
    ]

    return <div mix={hostStyle}>{children}</div>
  }
}
