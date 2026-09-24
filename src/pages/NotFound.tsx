import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <section className="page-head">
      <h1>No encontramos eso</h1>
      <p className="lead">
        Puede que el link esté mal o que el cuestionario haya cambiado de lugar. <Link to="/">Volver a las materias</Link>.
      </p>
    </section>
  )
}
