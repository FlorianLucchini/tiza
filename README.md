# Tiza

Cuestionarios interactivos para practicar la teoría de las materias: preguntas reales de
parciales y parcialitos, y preguntas generadas con IA para cubrir el resto del temario. Siempre
está marcado cuál es cuál.

**Sitio:** https://florianlucchini.github.io/tiza/

## Qué hay

| Materia | Cuestionario | Preguntas |
|---|---|---|
| Sistemas Operativos (FIUBA) | Parcialito TP1 — Shell | 20 reales (1C2024) + 43 con IA |

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run check    # typecheck + lint + tests (incluye validación del contenido)
npm run build    # build de producción en dist/
```

Cada push a `main` se publica solo en GitHub Pages (`.github/workflows/deploy.yml`).

## Agregar preguntas

Los cuestionarios son archivos TypeScript en `src/content/<institución>/<materia>/`, tipados con
`src/content/types.ts`. Reglas de contenido (sobre todo real vs. IA) en
[`.claude/CLAUDE.md`](.claude/CLAUDE.md); paso a paso en
[`.claude/skills/nuevo-cuestionario`](.claude/skills/nuevo-cuestionario/SKILL.md).

¿Encontraste un error en una pregunta? Abrí un issue.

## Docs

- [`IDEA.md`](IDEA.md): la visión y todo lo que se fue pidiendo.
- [`docs/decisiones.md`](docs/decisiones.md): decisiones tomadas y por qué.
- [`docs/ROADMAP.md`](docs/ROADMAP.md): ideas y próximos pasos.
