import { Link, useParams } from 'react-router-dom'
import { findSubject } from '../content'
import { getQuizRecord } from '../lib/storage'
import { NotFound } from './NotFound'

export function SubjectPage() {
  const { subjectId } = useParams()
  const subject = findSubject(subjectId)
  if (!subject) return <NotFound />

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/">Materias</Link>
      </nav>
      <section className="page-head">
        <span className="eyebrow">
          {subject.institution}
          {subject.career && ` · ${subject.career}`}
          {subject.code && ` · ${subject.code}`}
        </span>
        <h1>{subject.name}</h1>
        {subject.description && <p className="lead">{subject.description}</p>}
      </section>

      <div className="card-grid">
        {subject.quizzes.map((quiz) => {
          const real = quiz.questions.filter((q) => q.source.kind === 'real').length
          const record = getQuizRecord(subject.id, quiz.id)
          return (
            <Link key={quiz.id} to={`/${subject.id}/${quiz.id}`} className="card card-link">
              <h3>{quiz.title}</h3>
              <p className="muted">{quiz.description}</p>
              <span className="card-meta">
                {quiz.questions.length} preguntas · {real} reales · {quiz.questions.length - real} con IA
              </span>
              {record && (
                <span className="card-meta">
                  Mejor resultado: <strong>{Math.round(record.best * 100)}%</strong> · {record.attempts}{' '}
                  {record.attempts === 1 ? 'intento' : 'intentos'}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </>
  )
}
