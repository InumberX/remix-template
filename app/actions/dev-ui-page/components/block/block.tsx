import { css, type Handle } from 'remix/ui'

import * as styles from './block.styles.ts'
import type { BlockProps } from './block.types.ts'

export type * from './block.types.ts'

/** Visible filler so the layout's boxes can be seen. */
export function Block(handle: Handle<BlockProps>) {
  return () => {
    const { grow, label } = handle.props

    return <div mix={css({ ...styles.block, ...(grow ? styles.block__grow : null) })}>{label}</div>
  }
}
