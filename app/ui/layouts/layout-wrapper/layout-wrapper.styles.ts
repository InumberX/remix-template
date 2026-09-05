import type { StyleRecipe } from '../../styles/public/mixins.ts'

/**
 * generalview declared `100vb` and then `100svb`, relying on a browser without
 * small-viewport units dropping the second and keeping the first. That form does
 * not survive the port: a recipe is a plain object, so one key holds one value.
 *
 * `100svb` is the value worth keeping — it is the one that accounts for mobile
 * browser chrome — and it is Baseline, as are `overflow: clip`, container
 * queries and `color-mix` used elsewhere here. A browser without it simply gets
 * no minimum block size. Restoring a true fallback would need `@supports`, not a
 * second declaration.
 */
export const layoutWrapper: StyleRecipe = {
  display: 'flex',
  flexDirection: 'column',
  minBlockSize: '100svb',
  position: 'relative',
}
