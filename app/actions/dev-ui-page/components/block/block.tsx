import type { Handle } from 'remix/ui'

import * as styles from './block.styles.ts'
import type { BlockProps } from './block.types.ts'

export type * from './block.types.ts'

/** Visible filler so the layout's boxes can be seen. */
export function Block(handle: Handle<BlockProps>) {
  return () => (
    <div mix={styles.block} style={handle.props.grow ? { flex: '1 1 auto' } : undefined}>
      {handle.props.label}
    </div>
  )
}
