// Content model. Kept free of UI concerns so it can later move to a database
// or an API without touching components.

/** 1 = basic, 2 = intermediate, 3 = advanced. */
export type Difficulty = 1 | 2 | 3

/** Where a question comes from. Real exam questions must never be mixed up with generated ones. */
export type Source =
  | {
      kind: 'real'
      /** Human label of the original exam, e.g. "Parcialito TP1 · 1C2024". */
      exam: string
      /** Whether the correct answer was confirmed by the course staff (graded form) or not. */
      answerVerified: boolean
    }
  | { kind: 'ai' }

export interface Option {
  id: string
  /** Supports the tiny markdown subset rendered by `RichText`. */
  text: string
}

export interface ChoiceQuestion {
  id: string
  /** `single`: exactly one answer. `multiple`: one or more answers, all must be selected. */
  kind: 'single' | 'multiple'
  prompt: string
  options: Option[]
  /** Ids of the correct options. */
  answer: string[]
  explanation: string
  difficulty: Difficulty
  source: Source
  topics: string[]
}

// Future kinds (open answer, code with an evaluator) join this union.
export type Question = ChoiceQuestion

export interface Reference {
  label: string
  url?: string
}

export interface Quiz {
  id: string
  title: string
  description: string
  /** Free-form context shown before starting (exam date, scope, etc.). */
  context?: string
  references?: Reference[]
  questions: Question[]
}

export interface Subject {
  id: string
  name: string
  /** Official course codes, e.g. "TA043 · 95.03". */
  code?: string
  institution: string
  career?: string
  description?: string
  quizzes: Quiz[]
}
