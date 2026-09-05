// Ported from auba-general-view: app/styles/variables/font.css.ts
//
// Colors and font weights are NOT duplicated here — they are CSS custom
// properties declared in `@layer base` of public/static/css/app.css, so that
// the `util` layer can override them. Reference them with `var(--…)`; a TS
// copy would be a second source of truth the cascade cannot reach.
import { getClampRem, type StyleRecipe } from './mixins.ts'

export const fontSmall: StyleRecipe = {
  fontSize: getClampRem(12, 14),
  fontWeight: 'var(--font-weight-medium)',
}

export const fontSmallBold: StyleRecipe = {
  fontSize: getClampRem(12, 14),
  fontWeight: 'var(--font-weight-bold)',
}
