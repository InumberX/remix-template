import type { Handle } from 'remix/ui'

import * as styles from './specimen.styles.ts'
import type { SpecimenProps } from './specimen.types.ts'

export type * from './specimen.types.ts'

/** A single labelled variant of a component. */
export function Specimen(handle: Handle<SpecimenProps>) {
  return () => (
    <div mix={styles.specimen}>
      <span mix={styles.specimen_label}>{handle.props.label}</span>
      <div mix={styles.specimen_stage}>{handle.props.children}</div>
    </div>
  )
}
