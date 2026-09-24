---
name: nuevo-cuestionario
description: Use when Florian asks to add a quiz, parcialito, exam or set of questions to Tiza (from a PDF, screenshots, a transcript or a topic), or to extend an existing quiz with more questions.
---

# Cargar un cuestionario en Tiza

Transforma material de examen o de estudio en un módulo `.ts` validado. Leer primero las reglas
de contenido en `.claude/CLAUDE.md`: son obligatorias.

## 1. Leer el material real

- **PDF con texto**: `pdftotext -layout archivo.pdf -`.
- **Formularios de Google, escaneos o cualquier cosa donde importe qué opción está marcada**: el
  texto no alcanza. Renderizar las páginas (`pdftoppm -r 90 -png`) y mirarlas: el formulario
  corregido muestra ✓/✗ por opción y "Respuesta correcta" sólo cuando el alumno le erró. En las
  que acertó, la correcta es la que está marcada.
- Distinguir **corregido** (respuesta de la cátedra → `answerVerified: true`) de **copia del
  alumno sin corrección** (→ `answerVerified: false`, y avisarle a Florian).
- No transcribir datos personales que aparezcan en el material (nombres, padrones, mails).

## 2. Transcribir las preguntas reales

- Enunciado y opciones **textuales**. Sólo se agrega formato (backticks, cursivas).
- `id: 'real-NN'`, `source: { kind: 'real', exam: '<Examen> · <cuatrimestre>', answerVerified }`.
- Asignar dificultad (1–3) con el criterio de `.claude/CLAUDE.md`.
- Escribir una explicación breve que diga **por qué** es la correcta y por qué fallan los
  distractores típicos.

## 3. Generar las preguntas de IA

- Hacer primero una lista de **qué temas del material no cubren las reales** y generar para esos
  huecos. El objetivo es cubrir toda la teoría del tema, no repetir las reales con otras palabras.
- Basarse en el enunciado del TP, la bibliografía y las diapositivas de la materia. Si un dato no
  se puede verificar contra una fuente, no usarlo.
- `id: 'ai-NN'`, `source: { kind: 'ai' }`. Distractores plausibles y una sola respuesta
  defendible (o `kind: 'multiple'` con todas las correctas).
- Repartir las dificultades. Que haya preguntas de escenario ("¿qué pasa si…?") en el nivel 3.

## 4. Registrar y validar

1. Crear `src/content/<institución>/<materia>/<id-cuestionario>.ts` exportando un `Quiz` (ver
   `fiuba/sistemas-operativos/tp1-shell.ts` como ejemplo; los helpers `opts` y `TRUE_FALSE` se
   pueden copiar).
2. Agregarlo al `Subject` que corresponda en `src/content/index.ts`, o crear el `Subject`.
3. Correr `npm run check` y `npm run build`. El test de contenido tiene que pasar.
4. Abrir `npm run dev` y responder algunas preguntas en el navegador (una `multiple`, una V/F).

## 5. Revisión

- Pedirle a un revisor distinto del que generó (otro modelo o un agente `code-reviewer`) que
  audite las preguntas de IA contra el material: errores conceptuales, opciones ambiguas,
  explicaciones que no coinciden con la respuesta.
- Reportarle a Florian cuántas reales y cuántas de IA hay, qué quedó con
  `answerVerified: false` y cualquier duda sobre el material.
