# Roadmap e ideas

Fases por relevancia, sin estimaciones. Lo que ya está hecho se tacha y se mueve a
[decisiones.md](decisiones.md) si hubo una decisión detrás.

## Fase 0 — Parcialito TP1 (hecho, 2026-09-24)

- [x] Sitio publicado en GitHub Pages.
- [x] Cuestionario de Sistemas Operativos, TP1 Shell: 20 preguntas reales (1C2024) + 43 con IA.
- [x] Filtros por origen y dificultad, orden de fácil a difícil o aleatorio, feedback con
      explicación, resultados por dificultad y origen, repetir las falladas.
- [x] Progreso guardado en el navegador (mejor resultado por cuestionario).

## Fase 1 — Más contenido, mismo formato

- Parcialito **TP2 (sched)** y **TP3 (fs)** de Sistemas Operativos. Material disponible en la
  bóveda (`Teoria/Parciales/Parcialitos/`): el TP3 de 1C2023 está corregido; el TP2 de 2022 es de
  otro TP (kernel/JOS) y **no** está corregido → cargarlo con `answerVerified: false`.
- Cuestionarios por **unidad teórica** (kernel, procesos, scheduling, memoria, concurrencia,
  filesystems) para el parcial del 27-28/10.
- Otras materias de Florian: Paradigmas, Modelación Numérica.
- Skill `nuevo-cuestionario` (ya hay una primera versión en `.claude/skills/`): afinarla con el
  uso.

## Fase 2 — Nuevos tipos de pregunta

- **Verdadero/falso con justificación**: elegir y después ver la justificación modelo.
- **Respuesta abierta / teórica**: el alumno escribe y compara con una respuesta modelo, con
  autoevaluación ("la tenía / la tenía a medias / no la tenía").
- **Ejercicios con cuentas** (paginación, scheduling, inodos): resultado numérico con tolerancia,
  y pasos de la resolución que se revelan de a uno.
- **Ordenar pasos** (por ejemplo, la secuencia de una syscall o un context switch) y **completar
  código**.
- Cada tipo nuevo es otra variante de la unión `Question` en `src/content/types.ts`.

## Fase 3 — Aprender mejor

- **Repetición espaciada**: priorizar las preguntas que uno falla (hoy sólo se guarda el mejor
  resultado por cuestionario; faltaría guardarlo por pregunta).
- **Modo examen**: con tiempo límite, sin feedback hasta el final, como el parcialito real.
- **Tags de tema** navegables: "todas las preguntas de señales" a través de cuestionarios.
- **Bibliografía por pregunta**, no sólo por cuestionario: "esto sale de OSTEP cap. 5, §5.3".
- **Reportar un error** en una pregunta (un link a un issue de GitHub prellenado alcanza al
  principio).
- Mostrar la **tasa de acierto** de cada pregunta (requiere backend).

## Fase 4 — Plataforma

- **Backend y base de datos**: cuentas, progreso entre dispositivos, estadísticas agregadas.
  Opciones a evaluar cuando haga falta: Supabase o Convex (con auth incluida), o un backend
  propio. El modelo de `src/content/types.ts` está pensado para migrar sin tocar la UI.
- **Evaluador de código**: subir o escribir código y correrlo contra tests (ejercicios de C
  para Sistemas Operativos, Haskell/Prolog para Paradigmas…). Requiere ejecución aislada:
  sandbox en el servidor (contenedores, Judge0) o en el navegador (WebAssembly, Pyodide para
  Python).
- **Otras carreras e instituciones**: hoy `Subject` ya tiene `institution` y `career`; habría
  que sumar navegación por carrera.
- **Contribuciones de compañeros**: un formato y una revisión para que otros suban preguntas
  (PR al repo al principio; un editor web después).
- **Generación asistida**: un flujo con Claude para proponer preguntas a partir de un PDF, con
  revisión humana antes de publicar.

## Design system (pendiente, a pedido de Florian)

- Crear una **skill de design system** (`.claude/skills/design-system/`) que documente los
  tokens, los componentes (card, badge, button, segmented, option, feedback) y las reglas de uso.
- Formalizar la **paleta**: hoy vive en `src/styles/tokens.css` (papel + verde pizarrón + tiza,
  con amarillo de resaltado). Validar contraste AA en los dos temas.
- Decidir si se suma una librería de componentes accesibles (Radix, React Aria) cuando haya
  controles más complejos (modales, menús).
- Íconos: hoy son SVG a mano; si crecen, usar un set (Lucide).
- Logo e identidad de Tiza más trabajados.

## Harness (`.claude/`)

Ideas de reglas, skills y agentes para el proyecto:

- **Regla (ya en `CLAUDE.md`)**: nunca mezclar preguntas reales con generadas; el `source` y el
  prefijo del id son obligatorios.
- **Skill `nuevo-cuestionario`** (primera versión hecha): de PDF o capturas a un `.ts` validado.
- **Skill `revisar-cuestionario`**: auditar las preguntas de IA contra la bibliografía (errores
  conceptuales, opciones ambiguas, más de una opción defendible).
- **Skill `design-system`**: ver arriba.
- **Agente revisor de contenido**: un modelo distinto del que generó las preguntas las revisa
  antes de publicar.
- **Hook o CI**: el workflow ya corre `npm run check`; sumar un chequeo de accesibilidad
  (axe) cuando haya más pantallas.

## Preguntas abiertas

- ¿Se aceptan contribuciones de otros desde el principio? ¿Con qué revisión?
- ¿Hace falta login algún día, o alcanza con progreso local más exportar/importar?
- ¿Cómo se atribuye el material real (repo de otros alumnos, cátedra)? Hoy se cita la fuente en
  el badge y en la bibliografía.
