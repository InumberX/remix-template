import { css, type Handle } from 'remix/ui'

import * as styles from './section.styles.ts'
import type { SectionProps } from './section.types.ts'

export type * from './section.types.ts'

/** One component's group of specimens, with its heading and note. */
export function Section(handle: Handle<SectionProps>) {
  return () => (
    <section mix={css(styles.section)}>
      <h2 mix={css(styles.section_title)}>{handle.props.title}</h2>
      <p mix={css(styles.section_note)}>{handle.props.note}</p>
      <div mix={css(styles.section_grid)}>{handle.props.children}</div>
    </section>
  )
}
