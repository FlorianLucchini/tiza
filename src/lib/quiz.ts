import type { Difficulty, Question } from '../content/types'

export type SourceFilter = 'all' | 'real' | 'ai'
export type DifficultyFilter = 'all' | Difficulty
export type Order = 'difficulty' | 'random'

export interface Settings {
  source: SourceFilter
  difficulty: DifficultyFilter
  order: Order
  shuffleOptions: boolean
}

export const DEFAULT_SETTINGS: Settings = { source: 'all', difficulty: 'all', order: 'difficulty', shuffleOptions: true }

export const DIFFICULTY_LABEL: Record<Difficulty, string> = { 1: 'Básica', 2: 'Intermedia', 3: 'Avanzada' }

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function selectQuestions(questions: Question[], settings: Settings): Question[] {
  const filtered = questions.filter(
    (q) =>
      (settings.source === 'all' || q.source.kind === settings.source) &&
      (settings.difficulty === 'all' || q.difficulty === settings.difficulty),
  )
  if (settings.order === 'random') return shuffle(filtered)
  // Stable sort by difficulty; within a level, interleave sources so real questions are not all first.
  return shuffle(filtered).sort((a, b) => a.difficulty - b.difficulty)
}

/** Deterministic shuffle keyed by a string, so the "unshuffled" order of a question is stable. */
function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const random = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function prepareOptions(question: Question, shuffleOptions: boolean): Question {
  // "All/none of the above" style options must stay last to keep their meaning.
  if (question.options.some((o) => /anteriores/i.test(o.text)) || isTrueFalse(question)) return question
  if (shuffleOptions) return { ...question, options: shuffle(question.options) }
  // Real questions keep the exam's original order. Generated ones are authored with the answer
  // first, so they always get a fixed per-question order to avoid giving the answer away.
  if (question.source.kind === 'ai') return { ...question, options: seededShuffle(question.options, question.id) }
  return question
}

export function isTrueFalse(question: Question): boolean {
  return question.options.length === 2 && question.options[0].text === 'Verdadero'
}

export function isCorrect(question: Question, selected: readonly string[]): boolean {
  return selected.length === question.answer.length && question.answer.every((id) => selected.includes(id))
}
