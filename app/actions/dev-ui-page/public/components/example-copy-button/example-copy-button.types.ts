import type { SerializableProps } from 'remix/ui'

/**
 * Hydrated props must be serializable — they cross from the server render into
 * the browser, so no functions and no class instances.
 */
export type ExampleCopyButtonProps = SerializableProps & {
  text: string
}
