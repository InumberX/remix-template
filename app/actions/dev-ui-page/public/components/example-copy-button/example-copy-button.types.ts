/**
 * Hydrated props must be serializable — they cross from the server render into
 * the browser, so no functions and no class instances. `clientEntry` enforces
 * this in its own signature, so a non-serializable prop is a type error at the
 * `clientEntry(...)` call.
 */
export type ExampleCopyButtonProps = {
  text: string
}
