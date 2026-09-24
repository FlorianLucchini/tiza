# Tiza — reglas del proyecto

Sitio de cuestionarios interactivos para practicar la teoría de las materias. Visión y todo lo
que pidió Florian: [`IDEA.md`](../IDEA.md) · decisiones: [`docs/decisiones.md`](../docs/decisiones.md)
· pendientes: [`docs/ROADMAP.md`](../docs/ROADMAP.md).

## Mantener la documentación viva

- **Todo lo que Florian diga sobre el proyecto** (visión, pedidos, preferencias, cambios de
  idea) se anota con fecha en `IDEA.md`, sección *Lo que fue diciendo Florian*. Es un pedido
  explícito suyo.
- Cada decisión técnica o de producto con alternativas se registra en `docs/decisiones.md`.
- Las ideas para más adelante van a `docs/ROADMAP.md`, por fases de relevancia y sin estimar
  tiempos.

## Contenido: preguntas reales vs. generadas con IA

Es la regla más importante del proyecto.

- Toda pregunta tiene `source`: `{ kind: 'real', exam, answerVerified }` o `{ kind: 'ai' }`.
  **Nunca** se marca como real una pregunta generada o reformulada.
- Id con prefijo según el origen: `real-NN` o `ai-NN`. El test lo exige.
- **Real** = transcripción textual del examen: el enunciado y las opciones como estaban (sólo se
  permite formato: backticks para código, cursivas). `answerVerified: true` sólo si la respuesta
  viene de una corrección de la cátedra (formulario corregido, resolución oficial). Si es lo que
  marcó un alumno sin corrección, va `false`.
- La **explicación** de una pregunta real la escribe la IA: la UI ya lo aclara ("explicación
  generada con IA").
- **Preguntas de IA**: tienen que salir del material de la materia (enunciado, bibliografía,
  diapositivas) y ser verificables. Sin opciones ambiguas ni con dos respuestas defendibles.
  Distractores plausibles, no absurdos. Si una opción depende de un detalle de implementación
  que no está en el material, no va.
- Opciones del estilo "Todas / Ninguna de las anteriores" hacen que la mezcla de opciones se
  desactive en esa pregunta (ver `prepareOptions`). Verdadero/Falso tampoco se mezcla.
- **Dificultad**: 1 = definición o dato directo; 2 = aplicar un concepto o distinguir casos;
  3 = razonar un escenario, detalles finos o combinar varios temas.
- Todo el contenido en **español rioplatense** (voseo), con términos técnicos en inglés cuando
  así se usan en la materia (*file descriptor*, *pipe*, *handler*).

Para cargar un cuestionario nuevo usar la skill [`nuevo-cuestionario`](skills/nuevo-cuestionario/SKILL.md).

## Código

- Stack: Vite + React 19 + TypeScript, `HashRouter`, sin backend. Contenido en
  `src/content/<institución>/<materia>/<cuestionario>.ts`, registrado en `src/content/index.ts`.
- El modelo (`src/content/types.ts`) no depende de la UI: tiene que poder migrar a JSON, a una
  base de datos o a una API sin tocar componentes.
- Estilos: sólo variables de `src/styles/tokens.css` (nada de colores sueltos en los
  componentes). Los dos temas (claro y oscuro) tienen que verse bien.
- Comentarios de código en inglés; UI, contenido y docs en español.
- `localStorage` siempre dentro de try/catch (`src/lib/storage.ts`): el sitio tiene que andar
  sin él.

## Verificar antes de commitear

```bash
npm run check   # tsc + oxlint + vitest (incluye la validación del contenido)
npm run build
```

Para cambios de UI, además, mirarlo en el navegador (`npm run dev`) en los dos temas y en ancho
de celular.

## Deploy

Push a `main` → el workflow `.github/workflows/deploy.yml` corre `npm run check`, construye y
publica en GitHub Pages: https://florianlucchini.github.io/tiza/

## Git

- Repo público `FlorianLucchini/tiza` (cuenta personal; la máquina la elige por carpeta).
- Conventional Commits en inglés (`feat:`, `fix:`, `content:` para preguntas nuevas, `docs:`,
  `chore:`).
