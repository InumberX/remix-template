import { css, type Handle } from 'remix/ui'

import * as styles from './stage.styles.ts'
import type { StageProps } from './stage.types.ts'

export type * from './stage.types.ts'

/** Bounded viewport so a full-width layout stays inspectable on this page. */
export function Stage(handle: Handle<StageProps>) {
  return () => <div mix={css(styles.stage)}>{handle.props.children}</div>
}
