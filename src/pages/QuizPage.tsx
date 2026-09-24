import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findQuiz, findSubject } from '../content'
import type { Difficulty, Question, Quiz, Subject } from '../content/types'
import { DifficultyBadge, SourceBadge } from '../components/Badges'
import { RichText } from '../components/RichText'
import {
  DEFAULT_SETTINGS,
  DIFFICULTY_LABEL,
  isCorrect,
  prepareOptions,
  selectQuestions,
  type Settings,
} from '../lib/quiz'
import { saveQuizResult } from '../lib/storage'
import { NotFound } from './NotFound'

interface Answer {
  question: Question
  selected: string[]
  correct: boolean
}

type Phase =
  | { name: 'setup' }
  | { name: 'run'; deck: Question[]; retry: boolean }
  | { name: 'done'; answers: Answer[]; retry: boolean }

export function QuizPage() {
  const { subjectId, quizId } = useParams()
  const subject = findSubject(subjectId)
  const quiz = findQuiz(subject, quizId)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })

  if (!subject || !quiz) return <NotFound />

  const start = (questions: Question[], retry: boolean) =>
    setPhase({ name: 'run', deck: questions.map((q) => prepareOptions(q, settings.shuffleOptions)), retry })

  const finish = (answers: Answer[], retry: boolean) => {
    if (!retry && answers.length > 0)
      saveQuizResult(subject.id, quiz.id, answers.filter((a) => a.correct).length / answers.length)
    setPhase({ name: 'done', answers, retry })
  }

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/">Materias</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/${subject.id}`}>{subject.name}</Link>
      </nav>
      {phase.name === 'setup' && (
        <Setup
          quiz={quiz}
          settings={settings}
          onChange={setSettings}
          onStart={() => start(selectQuestions(quiz.questions, settings), false)}
        />
      )}
      {phase.name === 'run' && (
        <Runner
          key={phase.deck.map((q) => q.id).join()}
          deck={phase.deck}
          onFinish={(answers) => finish(answers, phase.retry)}
          onQuit={() => setPhase({ name: 'setup' })}
        />
      )}
      {phase.name === 'done' && (
        <Results
          subject={subject}
          answers={phase.answers}
          onRetryWrong={() =>
            start(
              phase.answers.filter((a) => !a.correct).map((a) => a.question),
              true,
            )
          }
          onRestart={() => setPhase({ name: 'setup' })}
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------

function Setup({
  quiz,
  settings,
  onChange,
  onStart,
}: {
  quiz: Quiz
  settings: Settings
  onChange: (s: Settings) => void
  onStart: () => void
}) {
  const selected = useMemo(() => selectQuestions(quiz.questions, settings), [quiz, settings])
  const count = (pred: (q: Question) => boolean) => quiz.questions.filter(pred).length
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => onChange({ ...settings, [key]: value })

  return (
    <section className="setup">
      <div className="page-head">
        <h1>{quiz.title}</h1>
        <p className="lead">{quiz.description}</p>
        {quiz.context && <p className="muted">{quiz.context}</p>}
      </div>

      <div className="panel">
        <fieldset className="segmented-field">
          <legend>Origen</legend>
          <Segmented
            value={settings.source}
            onChange={(v) => set('source', v)}
            options={[
              { value: 'all', label: `Todas (${quiz.questions.length})` },
              { value: 'real', label: `Reales (${count((q) => q.source.kind === 'real')})` },
              { value: 'ai', label: `Con IA (${count((q) => q.source.kind === 'ai')})` },
            ]}
          />
        </fieldset>
        <fieldset className="segmented-field">
          <legend>Dificultad</legend>
          <Segmented
            value={settings.difficulty}
            onChange={(v) => set('difficulty', v)}
            options={[
              { value: 'all', label: 'Todas' },
              ...([1, 2, 3] as Difficulty[]).map((d) => ({
                value: d,
                label: `${DIFFICULTY_LABEL[d]} (${count((q) => q.difficulty === d)})`,
              })),
            ]}
          />
        </fieldset>
        <fieldset className="segmented-field">
          <legend>Orden</legend>
          <Segmented
            value={settings.order}
            onChange={(v) => set('order', v)}
            options={[
              { value: 'difficulty', label: 'De fácil a difícil' },
              { value: 'random', label: 'Aleatorio' },
            ]}
          />
        </fieldset>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.shuffleOptions}
            onChange={(e) => set('shuffleOptions', e.target.checked)}
          />
          Mezclar el orden de las opciones
        </label>

        <div className="setup-actions">
          <button className="button primary" onClick={onStart} disabled={selected.length === 0}>
            Empezar · {selected.length} {selected.length === 1 ? 'pregunta' : 'preguntas'}
          </button>
          <span className="muted small">Atajos: 1–9 elige opción · Enter comprueba y avanza</span>
        </div>
      </div>
    </section>
  )
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="segmented" role="radiogroup">
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={o.value === value}
          className={o.value === value ? 'active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------

function Runner({
  deck,
  onFinish,
  onQuit,
}: {
  deck: Question[]
  onFinish: (answers: Answer[]) => void
  onQuit: () => void
}) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [answers, setAnswers] = useState<Answer[]>([])
  const question = deck[index]
  const correctSoFar = answers.filter((a) => a.correct).length

  const toggle = useCallback(
    (id: string) => {
      if (checked) return
      setSelected((prev) =>
        question.kind === 'single' ? [id] : prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      )
    },
    [checked, question],
  )

  const check = useCallback(() => {
    if (checked || selected.length === 0) return
    setChecked(true)
    setAnswers((prev) => [...prev, { question, selected, correct: isCorrect(question, selected) }])
  }, [checked, selected, question])

  const next = useCallback(() => {
    if (!checked) return
    if (index + 1 >= deck.length) {
      onFinish(answers)
      return
    }
    setIndex(index + 1)
    setSelected([])
    setChecked(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [checked, index, deck.length, answers, onFinish])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      const n = Number(e.key)
      if (n >= 1 && n <= question.options.length) {
        toggle(question.options[n - 1].id)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (checked) next()
        else check()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [question, checked, toggle, check, next])

  const last = answers[answers.length - 1]
  const result = checked ? last : undefined

  return (
    <section className="runner">
      <div className="progress-row">
        <span className="small muted">
          Pregunta {index + 1} de {deck.length}
        </span>
        <span className="small muted">
          {correctSoFar} bien de {answers.length}
        </span>
      </div>
      <div className="progress" aria-hidden="true">
        <div style={{ width: `${((index + (checked ? 1 : 0)) / deck.length) * 100}%` }} />
      </div>

      <article className="question-card">
        <div className="badges">
          <SourceBadge source={question.source} />
          <DifficultyBadge difficulty={question.difficulty} />
          {question.kind === 'multiple' && <span className="badge">Varias correctas</span>}
        </div>
        <div className="prompt">
          <RichText text={question.prompt} />
        </div>

        <ol className="options" role={question.kind === 'single' ? 'radiogroup' : 'group'}>
          {question.options.map((option, i) => {
            const isSelected = selected.includes(option.id)
            const isAnswer = question.answer.includes(option.id)
            const state = !checked
              ? isSelected
                ? 'selected'
                : ''
              : isAnswer
                ? isSelected
                  ? 'right'
                  : 'missed'
                : isSelected
                  ? 'wrong'
                  : 'dim'
            return (
              <li key={option.id}>
                <button
                  className={`option ${state}`}
                  onClick={() => toggle(option.id)}
                  role={question.kind === 'single' ? 'radio' : 'checkbox'}
                  aria-checked={isSelected}
                  disabled={checked}
                >
                  <span className={`option-key ${question.kind}`}>{i + 1}</span>
                  <span className="option-text">
                    <RichText text={option.text} inline />
                  </span>
                  {checked && isAnswer && (
                    <span className="option-tag">{isSelected ? '✓' : 'Correcta'}</span>
                  )}
                  {checked && !isAnswer && isSelected && <span className="option-tag">✗</span>}
                </button>
              </li>
            )
          })}
        </ol>

        {result && (
          <div className={`feedback ${result.correct ? 'ok' : 'bad'}`} role="status">
            <strong>{result.correct ? '¡Bien!' : question.kind === 'multiple' ? 'No del todo.' : 'No es esa.'}</strong>
            <RichText text={question.explanation} />
            {question.source.kind === 'real' && (
              <p className="small muted">
                Respuesta {question.source.answerVerified ? 'corregida por la cátedra' : 'sin confirmar'} ·
                explicación generada con IA.
              </p>
            )}
          </div>
        )}

        <div className="runner-actions">
          <button className="button ghost" onClick={onQuit}>
            Salir
          </button>
          {!checked ? (
            <button className="button primary" onClick={check} disabled={selected.length === 0}>
              Comprobar
            </button>
          ) : (
            <button className="button primary" onClick={next} autoFocus>
              {index + 1 >= deck.length ? 'Ver resultados' : 'Siguiente'}
            </button>
          )}
        </div>
      </article>
    </section>
  )
}

// ---------------------------------------------------------------------------

function Results({
  subject,
  answers,
  onRetryWrong,
  onRestart,
}: {
  subject: Subject
  answers: Answer[]
  onRetryWrong: () => void
  onRestart: () => void
}) {
  const right = answers.filter((a) => a.correct).length
  const wrong = answers.filter((a) => !a.correct)
  const pct = answers.length ? Math.round((right / answers.length) * 100) : 0

  const breakdown = (label: string, pred: (a: Answer) => boolean) => {
    const group = answers.filter(pred)
    if (group.length === 0) return null
    const ok = group.filter((a) => a.correct).length
    return (
      <div className="stat" key={label}>
        <span className="stat-label">{label}</span>
        <span className="stat-value">
          {ok}/{group.length}
        </span>
        <div className="meter" aria-hidden="true">
          <div style={{ width: `${(ok / group.length) * 100}%` }} />
        </div>
      </div>
    )
  }

  return (
    <section className="results">
      <div className="score">
        <span className="score-value">{pct}%</span>
        <span className="lead">
          {right} de {answers.length} bien
        </span>
      </div>

      <div className="stats">
        {([1, 2, 3] as Difficulty[]).map((d) => breakdown(DIFFICULTY_LABEL[d], (a) => a.question.difficulty === d))}
        {breakdown('Reales', (a) => a.question.source.kind === 'real')}
        {breakdown('Con IA', (a) => a.question.source.kind === 'ai')}
      </div>

      <div className="setup-actions">
        {wrong.length > 0 && (
          <button className="button primary" onClick={onRetryWrong}>
            Repetir las {wrong.length} falladas
          </button>
        )}
        <button className="button" onClick={onRestart}>
          Nuevo intento
        </button>
        <Link className="button ghost" to={`/${subject.id}`}>
          Volver a {subject.name}
        </Link>
      </div>

      {wrong.length > 0 && (
        <>
          <h2 className="section-title">Para repasar</h2>
          <div className="review">
            {wrong.map(({ question, selected }) => (
              <details key={question.id} className="review-item">
                <summary>
                  <RichText text={question.prompt.split('\n')[0]} inline />
                </summary>
                <div className="badges">
                  <SourceBadge source={question.source} />
                  <DifficultyBadge difficulty={question.difficulty} />
                </div>
                <p className="small">
                  <strong>Marcaste:</strong>{' '}
                  <RichText
                    text={
                      question.options
                        .filter((o) => selected.includes(o.id))
                        .map((o) => o.text)
                        .join(' · ') || '—'
                    }
                    inline
                  />
                </p>
                <p className="small">
                  <strong>Correcta:</strong>{' '}
                  <RichText
                    text={question.options
                      .filter((o) => question.answer.includes(o.id))
                      .map((o) => o.text)
                      .join(' · ')}
                    inline
                  />
                </p>
                <RichText text={question.explanation} />
              </details>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
