import { Link } from 'react-router-dom'
import { subjects } from '../content'

export function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>
          Repasá la teoría <span className="chalk-underline">en serio</span>.
        </h1>
        <p className="lead">
          Cuestionarios por materia, con preguntas reales de parciales y parcialitos y otras generadas con IA
          para cubrir todo el temario. Siempre está marcado cuál es cuál.
        </p>
      </section>

      <h2 className="section-title">Materias</h2>
      <div className="card-grid">
        {subjects.map((subject) => {
          const total = subject.quizzes.reduce((n, q) => n + q.questions.length, 0)
          return (
            <Link key={subject.id} to={`/${subject.id}`} className="card card-link">
              <span className="eyebrow">
                {subject.institution}
                {subject.code && ` · ${subject.code}`}
              </span>
              <h3>{subject.name}</h3>
              {subject.description && <p className="muted">{subject.description}</p>}
              <span className="card-meta">
                {subject.quizzes.length} {subject.quizzes.length === 1 ? 'cuestionario' : 'cuestionarios'} · {total}{' '}
                preguntas
              </span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
