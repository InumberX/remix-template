// Ported from auba-general-view: app/components/primitives/buttons/PrimitiveButton
//
// Unstyled skeleton. It owns element selection (anchor with a `url` — an empty
// one included, and without `href` when disabled — button with a `buttonType`,
// otherwise an inert tag), the accessibility attributes and the
// user-agent reset — nothing else. Design decisions belong to the styled tier in
// `app/ui/<category>/`, which passes them down through `styleOverrides`.
import { css, type Handle, type MixInput } from 'remix/component'

import * as styles from './primitive-button.styles.ts'
import type { PrimitiveButtonProps } from './primitive-button.types.ts'

export type * from './primitive-button.types.ts'

export function PrimitiveButton(handle: Handle<PrimitiveButtonProps>) {
  return () => {
    const {
      url,
      target,
      rel,
      buttonType = 'button',
      isDisabled,
      children,
      styleOverrides,
      mix,
      name,
      value,
      title,
      role,
      tabIndex,
      ariaLabel,
      ariaControls,
      ariaSelected,
      nonClickableTag = 'span',
    } = handle.props

    // One css(...) call: the reset, the caller's recipe and the disabled
    // treatment are merged as plain objects, so JS spread order decides which
    // declaration wins. Output is content-hashed and deduplicated.
    const hostStyle: MixInput<HTMLElement> = [
      css({
        ...styles.primitiveButton,
        ...styleOverrides,
        // Last, so no caller recipe (a styled tier's own `cursor` or
        // `pointer-events`) can switch the disabled treatment back off.
        ...(isDisabled ? styles.primitiveButton__disabled : null),
      }),
      mix,
    ]

    // `!== undefined`, not truthiness: an empty `url` is still a link (to the
    // current page), not a silent fall-through to a button or the inert tag.
    if (url !== undefined) {
      // A disabled link keeps its element but loses `href`: an `<a>` without
      // one is neither focusable nor followable, so Tab and Enter cannot reach
      // a destination that `pointer-events: none` only hid from the mouse.
      // `aria-disabled` keeps it announced as disabled, and the caller's role
      // (a disabled tab, say) survives; without one it stays a link.
      return (
        <a
          href={isDisabled ? undefined : url}
          target={isDisabled ? undefined : target}
          rel={isDisabled ? undefined : rel}
          title={title}
          role={isDisabled ? (role ?? 'link') : role}
          tabIndex={isDisabled ? undefined : tabIndex}
          aria-disabled={isDisabled ? 'true' : undefined}
          aria-label={ariaLabel}
          aria-controls={ariaControls}
          aria-selected={ariaSelected}
          data-rmx-document={!isDisabled && isDocumentNavigation(url) ? '' : undefined}
          mix={hostStyle}
        >
          {children}
        </a>
      )
    }

    // The raw prop, not the destructured `buttonType`: that one carries the
    // 'button' default above and is therefore always truthy. What decides this
    // branch is whether the caller asked for a button at all — with neither a
    // `url` nor a `buttonType`, the component falls through to the inert tag.
    if (handle.props.buttonType) {
      return (
        <button
          type={buttonType}
          disabled={isDisabled}
          name={name}
          value={value}
          title={title}
          role={role}
          tabIndex={tabIndex}
          aria-label={ariaLabel}
          aria-controls={ariaControls}
          aria-selected={ariaSelected}
          mix={hostStyle}
        >
          {children}
        </button>
      )
    }

    const Tag = nonClickableTag

    return (
      <Tag
        title={title}
        role={role}
        aria-label={ariaLabel}
        aria-controls={ariaControls}
        aria-selected={ariaSelected}
        mix={hostStyle}
      >
        {children}
      </Tag>
    )
  }
}

/** A stand-in origin to resolve relative URLs against; it never leaves this module. */
const APP_ORIGIN = 'https://app.invalid'

/**
 * Whether a link should bypass the client runtime's navigation and load as a
 * plain document: anything that does not resolve to this origin (another
 * site, `mailto:`, `tel:`, a protocol-relative `//host`), and an in-page
 * `#hash`, which should stay a plain browser jump. The URL is resolved the way
 * the browser resolves an href rather than matched as a string, so `/\host`
 * and a tab or newline smuggled into `/\t/host` — both of which a browser
 * reads as `//host` — count as another origin too.
 *
 * There is no request here to read the real origin from, so an absolute URL to
 * this site counts as another site and loads as a full document: still
 * correct, only slower. Pass internal links as `routes.<name>.href()` paths.
 */
const isDocumentNavigation = (url: string): boolean => {
  if (url.startsWith('#')) return true
  try {
    return new URL(url, APP_ORIGIN).origin !== APP_ORIGIN
  } catch {
    return true
  }
}
