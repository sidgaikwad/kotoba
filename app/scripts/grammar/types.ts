/**
 * The grammar catalogue.
 *
 * Which grammar points exist at each JLPT level is factual scope information
 * and is widely published. Every *explanation* and every *example sentence*
 * in this catalogue is written for this course — no textbook prose is
 * reproduced.
 *
 * Sourcing note kept visible because it matters: jlpt.jp publishes no
 * official grammar list. The 出題基準 was withdrawn in 2010, so level
 * assignment here follows the broad community consensus and is a *teaching
 * order*, not an authority. Where a point is commonly placed at two levels,
 * it sits at the earlier one — meeting something twice is cheaper than
 * meeting it too late.
 */

export type Example = {
  ja: string
  romaji: string
  en: string
  /** Where this would actually be said. Keeps register attached to grammar. */
  register?: 'casual' | 'polite' | 'business' | 'written'
}

export type GrammarPoint = {
  /** Stable id. Never derived from the title. */
  id: string
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  /** The pattern as a learner will search for it. */
  title: string
  /** How it attaches. Plain-language, not linguistics notation. */
  formation: string
  /** One line. What it does. */
  meaning: string
  /** Two to four sentences. Why it exists, when you reach for it. */
  explain: string
  examples: Example[]
  /** ids of points that get confused with this one. Drives interference. */
  contrast?: string[]
  /** Anything about politeness, channel, or who says this. */
  register?: string
  /** Grouping within a level, so units are coherent. */
  unit: string
}

export const P = (p: GrammarPoint) => p
