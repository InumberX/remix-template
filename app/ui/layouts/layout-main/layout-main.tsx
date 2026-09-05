// Ported from auba-general-view: app/components/ui/layouts/LayoutMain
//
// vanilla-extract's `createContainer()` generated a unique container name; here
// the name is a plain constant, since there is no build step to scope it.
import { css, type Handle, type MixInput } from 'remix/ui'

import * as styles from './layout-main.styles.ts'
import type { LayoutMainProps } from './layout-main.types.ts'

export type * from './layout-main.types.ts'

/** The page's main region, and the container `@container` queries resolve against. */
export function LayoutMain(handle: Handle<LayoutMainProps>) {
  return () => {
    const { children, tag = 'main', styleOverrides, mix } = handle.props
    const hostStyle: MixInput<HTMLElement> = [css({ ...styles.layoutMain, ...styleOverrides }), mix]
    const Tag = tag

    return <Tag mix={hostStyle}>{children}</Tag>
  }
}
