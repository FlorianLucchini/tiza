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
          <div className="header-actions">
            <a
              className="icon-button"
              href="https://github.com/FlorianLucchini"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub de Florian Lucchini"
              title="GitHub de Florian Lucchini"
            >
              <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                />
              </svg>
            </a>
            <ThemeToggle />
          </div>
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
