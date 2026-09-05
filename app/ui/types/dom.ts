// Shared DOM vocabulary for app/ui. Type-only: `import type` is erased from
// browser output, so this module needs no `public/` directory even when the
// components that use it are hydrated.
//
// Derive from Remix's own JSX types wherever Remix pins the union, and hand
// declare only the narrowings this app chooses to impose. `remix/ui` does not
// re-export its internal DOM types (`AriaRole`, `HTMLAttributeAnchorTarget`),
// so the JSX namespace is the supported seam.

/** Pinned by Remix as `'submit' | 'reset' | 'button'`; derived, not copied. */
export type ButtonType = NonNullable<JSX.IntrinsicElements['button']['type']>

/**
 * Remix types `<a target>` as `HTMLAttributeAnchorTarget`, which stays open to
 * arbitrary strings (named frames). This app only allows the four keywords.
 */
export type AnchorTarget = '_self' | '_blank' | '_parent' | '_top'

/** Remix types `<a rel>` as plain `string`; restricted to what this app uses. */
export type AnchorRel = 'noopener' | 'noreferrer' | 'noopener noreferrer'
