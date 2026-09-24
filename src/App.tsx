import { useEffect, useState } from 'react'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { SubjectPage } from './pages/SubjectPage'
import { QuizPage } from './pages/QuizPage'
import { getStoredTheme, storeTheme, type Theme } from './lib/storage'

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | undefined>(getStoredTheme)

  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme
  }, [theme])

  const toggle = () => {
    const current = theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    const next = current === 'dark' ? 'light' : 'dark'
    setTheme(next)
    storeTheme(next)
  }

  return (
    <button className="icon-button" onClick={toggle} aria-label="Cambiar tema claro/oscuro" title="Cambiar tema">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default function App() {
  return (
    <HashRouter>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="Tiza, inicio">
            <span className="brand-mark" aria-hidden="true" />
            tiza
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:subjectId" element={<SubjectPage />} />
          <Route path="/:subjectId/:quizId" element={<QuizPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <footer className="site-footer container">
        Hecho por estudiantes para estudiantes. Las preguntas <span className="badge badge-real">Real</span> salen de
        exámenes anteriores; las <span className="badge badge-ai">Generada con IA</span> pueden tener errores: si
        encontrás uno, avisá.
      </footer>
    </HashRouter>
  )
}
