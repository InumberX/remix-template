// Type-only module: no runtime exports, so it is erased from browser output and
// may live outside a `public/` directory even when the component is hydrated.
import type { MixInput, RemixNode } from 'remix/ui'

import type { StyleRecipe } from '../../../styles/public/mixins.ts'
import type { AnchorRel, AnchorTarget, ButtonType } from '../../../types/dom.ts'

export type { AnchorRel, AnchorTarget, ButtonType }

/** Local to this component: the tags it will fall back to when inert. */
export type NonClickableTag = 'span' | 'div' | 'p'

/**
 * Roles accepted by every element this component can render. Remix's DOM types
 * constrain `role` per element following ARIA-in-HTML, unlike React's uniformly
 * wide `AriaRole`, so this is the intersection of what `a[href]`, `button`, and
 * a generic tag will each accept.
 */
export type PrimitiveButtonRole =
  | 'button'
  | 'checkbox'
  | 'link'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'option'
  | 'radio'
  | 'switch'
  | 'tab'
  | 'treeitem'

export type PrimitiveButtonProps = {
  url?: string
  target?: AnchorTarget
  rel?: AnchorRel
  buttonType?: ButtonType
  isDisabled?: boolean
  children?: RemixNode
  /**
   * Style properties merged over the component's own recipe in a single
   * `css(...)` call.
   * Use this — not `mix` — whenever the override touches a property the reset
   * already sets (`color`, `font`, `padding`, …), because spread order is
   * deterministic while two descriptors on one element are not.
   */
  styleOverrides?: StyleRecipe
  /** Behavior and disjoint styling for the host element, e.g. `on('click', ...)`. */
  mix?: MixInput<HTMLElement>
  name?: string
  value?: string
  title?: string
  role?: PrimitiveButtonRole
  tabIndex?: number
  ariaLabel?: string
  ariaControls?: string
  ariaSelected?: boolean | 'true' | 'false'
  nonClickableTag?: NonClickableTag
}
