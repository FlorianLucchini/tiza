# Registro de decisiones

Una entrada por decisión, la más nueva arriba. Formato: qué se decidió, por qué, y qué alternativa
se descartó.

## 2026-09-24 — Stack inicial: Vite + React + TypeScript, sitio estático

- **Qué**: SPA estática con Vite, React 19 y TypeScript. Ruteo con `HashRouter` de
  `react-router-dom`. Sin backend.
- **Por qué**: Florian pidió React + TS y descartó Next. Un sitio estático alcanza para
  cuestionarios con estado local y se publica gratis en GitHub Pages. `HashRouter` y
  `base: './'` evitan los 404 de Pages al recargar una ruta, y el build funciona bajo cualquier
  sub-path.
- **Descartado**: Next.js (overkill, sin SSR necesario); `BrowserRouter` (necesita el hack del
  `404.html` en Pages).

## 2026-09-24 — El contenido vive como módulos TypeScript tipados

- **Qué**: cada cuestionario es un `.ts` en `src/content/<institución>/<materia>/`, tipado con
  `src/content/types.ts`. Un test (`src/content/content.test.ts`) valida la integridad: ids
  únicos, respuestas que existen entre las opciones, `single` con una sola respuesta y el prefijo
  `real-`/`ai-` según el origen.
- **Por qué**: `tsc` y el test atrapan errores de carga antes de publicar. El modelo de datos no
  depende de la UI, así que migrarlo a JSON, a una base de datos o a una API después es mecánico.
- **Descartado**: JSON suelto (sin chequeo de tipos) y un CMS o base de datos (complejidad que
  todavía no se necesita).

## 2026-09-24 — Origen de cada pregunta explícito en el modelo

- **Qué**: `source` es `{ kind: 'real', exam, answerVerified }` o `{ kind: 'ai' }`. La UI lo
  muestra siempre con un badge. `answerVerified` distingue una respuesta corregida por la cátedra
  de una que sólo marcó un alumno.
- **Por qué**: fue un pedido explícito, y hay material real sin corregir (por ejemplo, el
  parcialito TP2 de 2022, que es la copia del alumno sin la corrección).

## 2026-09-24 — Repo público + GitHub Pages por Actions

- **Qué**: `FlorianLucchini/tiza`, público. El workflow `deploy.yml` corre typecheck, lint, tests
  y build, y publica `dist/` en Pages.
- **Por qué**: Pages en repos privados requiere un plan pago (se probó: la API devuelve 422).
  Florian aceptó que sea público.
- **Descartado**: repo privado + repo público sólo con el build, y Vercel (más piezas).

## 2026-09-24 — Estética inicial "tiza"

- **Qué**: tokens en `src/styles/tokens.css`. Tema claro = papel con tinta verde pizarrón; tema
  oscuro = el pizarrón con texto color tiza; acento amarillo para el resaltado. Tipografías
  Fraunces (títulos), IBM Plex Sans (texto) e IBM Plex Mono (código).
- **Por qué**: Florian no tenía preferencia y pidió algo "básico, lindo y acorde al contexto".
  El nombre da el concepto. Es un primer borrador: la skill de design system lo va a formalizar.
