import type { Difficulty, Source } from '../content/types'
import { DIFFICULTY_LABEL } from '../lib/quiz'

export function SourceBadge({ source }: { source: Source }) {
  if (source.kind === 'ai')
    return (
      <span className="badge badge-ai" title="Pregunta generada con IA a partir del material de la materia">
        Generada con IA
      </span>
    )
  return (
    <span
      className="badge badge-real"
      title={source.answerVerified ? 'Pregunta real; la respuesta la corrigió la cátedra' : 'Pregunta real; respuesta sin confirmar'}
    >
      Real · {source.exam}
      {!source.answerVerified && ' · respuesta sin confirmar'}
    </span>
  )
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`badge badge-level level-${difficulty}`} aria-label={`Dificultad ${DIFFICULTY_LABEL[difficulty]}`}>
      <span className="level-dots" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <i key={n} className={n <= difficulty ? 'on' : ''} />
        ))}
      </span>
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  )
}
