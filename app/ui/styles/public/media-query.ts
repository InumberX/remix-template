// Ported from auba-general-view: app/styles/mixins/mediaQuery.css.ts
//
// Two adaptations for Remix:
//
// 1. These hold the WHOLE at-rule (`@media screen and ...`). `css(...)` takes
//    the at-rule itself as the object key, where vanilla-extract took only the
//    condition under an `'@media'` parent.
//
// 2. They are constants, not functions. A `css(...)` computed key must have a
//    literal type: a helper returning `string` makes TypeScript infer a string
//    index signature for the object literal, which then clashes with the
//    numeric index signature `CSSProps` inherits from `CSSStyleDeclaration`
//    ("'string' and 'number' index signatures are incompatible"). Every value
//    here is built from a `BREAKPOINTS` literal inside an `as const` object, so
//    the literal type survives and the constant drops straight into a key:
//
//      css({ color: 'red', [MEDIA_QUERY.MD]: { color: 'blue' } })
//
// Upper bounds are exclusive (`width < Npx`), which Media Queries Level 4 range
// syntax gives directly — the same syntax the lower bounds already use. Writing
// them as `<= (Npx - 1)` would need a second constant object, because TypeScript
// has no type-level arithmetic and `${BREAKPOINTS.md - 1}` degrades the string
// to a `${number}` pattern, breaking the computed key described above.
//
// Plain CSS cannot read these, so `public/static/css/app.css` writes its own
// conditions by hand — there is no PostCSS `@custom-media` here.
import { BREAKPOINTS } from './breakpoints.ts'

/** Mobile-first: at or above the breakpoint. Print always matches, as in generalview. */
export const MEDIA_QUERY = {
  XS: `@media screen and (width >= ${BREAKPOINTS.xs}px), print`,
  SM: `@media screen and (width >= ${BREAKPOINTS.sm}px), print`,
  MD: `@media screen and (width >= ${BREAKPOINTS.md}px), print`,
  LG: `@media screen and (width >= ${BREAKPOINTS.lg}px), print`,
  XL: `@media screen and (width >= ${BREAKPOINTS.xl}px), print`,
  XXL: `@media screen and (width >= ${BREAKPOINTS.xxl}px), print`,
  HOVER: '@media (any-hover: hover)',
  NOT_HOVER: '@media (any-hover: none)',
  PRINT: '@media print',
  NOT_SCRIPTING: '@media (scripting: none)',
  REDUCED_MOTION: '@media (prefers-reduced-motion: reduce)',
} as const

/**
 * Strictly below the breakpoint. `<` rather than `<= (breakpoint - 1)`, so a
 * fractional viewport width — browser zoom, some high-DPI devices — cannot fall
 * into a gap between this and the matching `MEDIA_QUERY` entry.
 */
export const MEDIA_QUERY_REVERSE = {
  XS: `@media screen and (width < ${BREAKPOINTS.xs}px)`,
  SM: `@media screen and (width < ${BREAKPOINTS.sm}px)`,
  MD: `@media screen and (width < ${BREAKPOINTS.md}px)`,
  LG: `@media screen and (width < ${BREAKPOINTS.lg}px)`,
  XL: `@media screen and (width < ${BREAKPOINTS.xl}px)`,
  XXL: `@media screen and (width < ${BREAKPOINTS.xxl}px)`,
} as const

/** Inclusive lower bound, exclusive upper bound. */
export const MEDIA_QUERY_BETWEEN = {
  XS_SM: `@media screen and (width >= ${BREAKPOINTS.xs}px) and (width < ${BREAKPOINTS.sm}px)`,
  XS_MD: `@media screen and (width >= ${BREAKPOINTS.xs}px) and (width < ${BREAKPOINTS.md}px)`,
  XS_LG: `@media screen and (width >= ${BREAKPOINTS.xs}px) and (width < ${BREAKPOINTS.lg}px)`,
  XS_XL: `@media screen and (width >= ${BREAKPOINTS.xs}px) and (width < ${BREAKPOINTS.xl}px)`,
  XS_XXL: `@media screen and (width >= ${BREAKPOINTS.xs}px) and (width < ${BREAKPOINTS.xxl}px)`,
  SM_MD: `@media screen and (width >= ${BREAKPOINTS.sm}px) and (width < ${BREAKPOINTS.md}px)`,
  SM_LG: `@media screen and (width >= ${BREAKPOINTS.sm}px) and (width < ${BREAKPOINTS.lg}px)`,
  SM_XL: `@media screen and (width >= ${BREAKPOINTS.sm}px) and (width < ${BREAKPOINTS.xl}px)`,
  SM_XXL: `@media screen and (width >= ${BREAKPOINTS.sm}px) and (width < ${BREAKPOINTS.xxl}px)`,
  MD_LG: `@media screen and (width >= ${BREAKPOINTS.md}px) and (width < ${BREAKPOINTS.lg}px)`,
  MD_XL: `@media screen and (width >= ${BREAKPOINTS.md}px) and (width < ${BREAKPOINTS.xl}px)`,
  MD_XXL: `@media screen and (width >= ${BREAKPOINTS.md}px) and (width < ${BREAKPOINTS.xxl}px)`,
  LG_XL: `@media screen and (width >= ${BREAKPOINTS.lg}px) and (width < ${BREAKPOINTS.xl}px)`,
  LG_XXL: `@media screen and (width >= ${BREAKPOINTS.lg}px) and (width < ${BREAKPOINTS.xxl}px)`,
  XL_XXL: `@media screen and (width >= ${BREAKPOINTS.xl}px) and (width < ${BREAKPOINTS.xxl}px)`,
} as const

/** Container queries need an ancestor with `container-type` set. */
export const CONTAINER_QUERY = {
  XS: `@container (width >= ${BREAKPOINTS.xs}px)`,
  SM: `@container (width >= ${BREAKPOINTS.sm}px)`,
  MD: `@container (width >= ${BREAKPOINTS.md}px)`,
  LG: `@container (width >= ${BREAKPOINTS.lg}px)`,
  XL: `@container (width >= ${BREAKPOINTS.xl}px)`,
  XXL: `@container (width >= ${BREAKPOINTS.xxl}px)`,
} as const

export const CONTAINER_QUERY_REVERSE = {
  XS: `@container (width < ${BREAKPOINTS.xs}px)`,
  SM: `@container (width < ${BREAKPOINTS.sm}px)`,
  MD: `@container (width < ${BREAKPOINTS.md}px)`,
  LG: `@container (width < ${BREAKPOINTS.lg}px)`,
  XL: `@container (width < ${BREAKPOINTS.xl}px)`,
  XXL: `@container (width < ${BREAKPOINTS.xxl}px)`,
} as const

export const CONTAINER_QUERY_BETWEEN = {
  XS_SM: `@container (width >= ${BREAKPOINTS.xs}px) and (width < ${BREAKPOINTS.sm}px)`,
  XS_MD: `@container (width >= ${BREAKPOINTS.xs}px) and (width < ${BREAKPOINTS.md}px)`,
  XS_LG: `@container (width >= ${BREAKPOINTS.xs}px) and (width < ${BREAKPOINTS.lg}px)`,
  XS_XL: `@container (width >= ${BREAKPOINTS.xs}px) and (width < ${BREAKPOINTS.xl}px)`,
  XS_XXL: `@container (width >= ${BREAKPOINTS.xs}px) and (width < ${BREAKPOINTS.xxl}px)`,
  SM_MD: `@container (width >= ${BREAKPOINTS.sm}px) and (width < ${BREAKPOINTS.md}px)`,
  SM_LG: `@container (width >= ${BREAKPOINTS.sm}px) and (width < ${BREAKPOINTS.lg}px)`,
  SM_XL: `@container (width >= ${BREAKPOINTS.sm}px) and (width < ${BREAKPOINTS.xl}px)`,
  SM_XXL: `@container (width >= ${BREAKPOINTS.sm}px) and (width < ${BREAKPOINTS.xxl}px)`,
  MD_LG: `@container (width >= ${BREAKPOINTS.md}px) and (width < ${BREAKPOINTS.lg}px)`,
  MD_XL: `@container (width >= ${BREAKPOINTS.md}px) and (width < ${BREAKPOINTS.xl}px)`,
  MD_XXL: `@container (width >= ${BREAKPOINTS.md}px) and (width < ${BREAKPOINTS.xxl}px)`,
  LG_XL: `@container (width >= ${BREAKPOINTS.lg}px) and (width < ${BREAKPOINTS.xl}px)`,
  LG_XXL: `@container (width >= ${BREAKPOINTS.lg}px) and (width < ${BREAKPOINTS.xxl}px)`,
  XL_XXL: `@container (width >= ${BREAKPOINTS.xl}px) and (width < ${BREAKPOINTS.xxl}px)`,
} as const
