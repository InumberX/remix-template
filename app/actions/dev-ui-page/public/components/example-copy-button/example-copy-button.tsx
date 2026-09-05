import { clientEntry, on, type Handle } from 'remix/ui'

import * as styles from './example-copy-button.styles.ts'
import type { ExampleCopyButtonProps } from './example-copy-button.types.ts'

export type * from './example-copy-button.types.ts'

const FADE_MS = 180
const HOLD_MS = 1200

type CopyState = 'idle' | 'copied' | 'failed' | 'resetting'

// Example only — the `Example` prefix marks it as reference material, and it
// lives with `/dev/ui` rather than in `app/ui/` because it is not shared UI.
// It is this project's one worked example of `clientEntry` hydration.
//
// This component hydrates independently; the rest of the page stays static HTML.
//
// The component is a named function declaration, not an arrow: `clientEntry`
// derives the export to hydrate from that name. The alternative — passing
// `${import.meta.url}#ExampleCopyButton` — puts the export name in a string that no
// rename refactor updates, and a stale one still renders and typechecks while
// hydration silently fails in the browser.
export const ExampleCopyButton = clientEntry(
  import.meta.url,
  function ExampleCopyButton(handle: Handle<ExampleCopyButtonProps>) {
    let state: CopyState = 'idle'

    return () => {
      const promptLabel = `\u201C${handle.props.text}\u201D`
      const label =
        state === 'copied' || state === 'resetting'
          ? 'Copied to clipboard'
          : state === 'failed'
            ? 'Copy failed'
            : promptLabel
      const active = state === 'copied' || state === 'failed' || state === 'resetting'

      return (
        <button
          type="button"
          mix={[
            styles.exampleCopyButton,
            on('click', async (_event, signal) => {
              try {
                await navigator.clipboard.writeText(handle.props.text)
                if (signal.aborted) return
              } catch {
                state = 'failed'
                await handle.update()
                await wait(HOLD_MS)
                if (signal.aborted) return
                state = 'resetting'
                await handle.update()
                await wait(FADE_MS)
                if (signal.aborted) return
                state = 'idle'
                await handle.update()
                return
              }

              state = 'copied'
              await handle.update()
              await wait(HOLD_MS)
              if (signal.aborted) return

              state = 'resetting'
              await handle.update()
              await wait(FADE_MS)
              if (signal.aborted) return

              state = 'idle'
              await handle.update()
            }),
          ]}
          // Inverted while a copy result is showing: an unmistakable state
          // change built from the two colour tokens the app actually declares.
          style={
            active
              ? {
                  background: 'var(--color-util-black)',
                  color: 'var(--color-util-white)',
                }
              : undefined
          }
        >
          <span aria-hidden="true" mix={styles.exampleCopyButton_icon}>
            <CopyIcon />
          </span>
          <span
            mix={styles.exampleCopyButton_label}
            style={{ opacity: state === 'resetting' ? 0 : 1 }}
          >
            <span
              aria-hidden={state === 'idle' ? true : undefined}
              mix={styles.exampleCopyButton_status}
              style={{ visibility: state === 'idle' ? 'hidden' : 'visible' }}
            >
              {label}
            </span>
            <span
              aria-hidden={state === 'idle' ? undefined : true}
              style={{ visibility: state === 'idle' ? 'visible' : 'hidden' }}
            >
              {promptLabel}
            </span>
          </span>
        </button>
      )
    }
  }
)

export function CopyIcon() {
  return () => (
    <svg viewBox="0 0 14 16.5" fill="none">
      <path
        d="M0.75 9.188L0.75 4.083C0.75 2.242 2.242 0.75 4.083 0.75L9.188 0.75M5.75 15.75L11.375 15.75C12.41 15.75 13.25 14.91 13.25 13.875L13.25 5.75C13.25 4.714 12.41 3.875 11.375 3.875L5.75 3.875C4.714 3.875 3.875 4.714 3.875 5.75L3.875 13.875C3.875 14.91 4.714 15.75 5.75 15.75Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  )
}

const wait = (ms: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
