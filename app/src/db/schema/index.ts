/**
 * The core is exported flat. Language extensions are namespaced, so that
 * `import { card } from './schema'` can never accidentally reach a Japanese
 * table — you have to type `ja.` to cross the seam, and that is the point.
 */
export * from './core'
export * as ja from './ja'
