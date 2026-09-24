// Per-browser persistence. Storage can be unavailable (private mode, blocked
// site data), so every access is guarded and the app works without it.

const PREFIX = 'tiza:v1:'

export interface QuizRecord {
  attempts: number
  best: number
  last: number
  lastAt: string
}

function read<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Ignore: persistence is a convenience.
  }
}

export function getQuizRecord(subjectId: string, quizId: string): QuizRecord | undefined {
  return read<QuizRecord>(`record:${subjectId}/${quizId}`)
}

/** `score` is a 0..1 ratio. */
export function saveQuizResult(subjectId: string, quizId: string, score: number): void {
  const previous = getQuizRecord(subjectId, quizId)
  write(`record:${subjectId}/${quizId}`, {
    attempts: (previous?.attempts ?? 0) + 1,
    best: Math.max(previous?.best ?? 0, score),
    last: score,
    lastAt: new Date().toISOString(),
  } satisfies QuizRecord)
}

export type Theme = 'light' | 'dark'

export function getStoredTheme(): Theme | undefined {
  return read<Theme>('theme')
}

export function storeTheme(theme: Theme): void {
  write('theme', theme)
}
