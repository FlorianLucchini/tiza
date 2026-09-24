# Tiza — la idea

> Documento vivo. Acá va **todo lo que Florian va diciendo** sobre el proyecto (visión, pedidos,
> preferencias), con fecha. Lo que se decide en concreto va a [docs/decisiones.md](docs/decisiones.md) y lo
> que queda para más adelante a [docs/ROADMAP.md](docs/ROADMAP.md).

## Qué es

Un sitio para **practicar la teoría de las materias** con cuestionarios interactivos, organizados
por materia, tema y dificultad. Pensado primero para uso propio y de compañeros de cursada, pero
con la ambición de crecer: más materias, más carreras, más tipos de ejercicio.

Principios que salen de lo que pidió Florian:

- **Didáctico y dinámico**: responder, recibir feedback inmediato y entender *por qué*.
- **Siempre claro qué es real y qué es de IA.** Las preguntas de exámenes reales se marcan como
  tales; las generadas con IA también, sin excepción.
- **Por dificultad**: poder ir de lo básico a lo avanzado, sin que el orden dependa de si la
  pregunta es real o generada.
- **Con bibliografía**: cada cuestionario enlaza al material de donde sale. *(Sacada por ahora, a pedido de Florian, 2026-09-24.)*
- **Simple ahora, escalable después**: nada de complejidad que no haga falta hoy, pero sin
  cerrarle la puerta a una base de datos, un evaluador de código, etc.

## Lo que fue diciendo Florian

### 2026-09-24 — arranque

- La idea general: un sitio (GitHub Pages sirve) donde subir cuestionarios **por materia**. No
  sólo multiple choice: también **ejercicios y preguntas teóricas**.
- Cuestionarios sobre **distintos temas y de distinto nivel**, "como para responder".
- "No lo tengo muy bien craneado todavía, pero tampoco me interesa sumar complejidad ahora."
  **Foco inmediato: el parcialito del TP1 (shell) de Sistemas Operativos, el 25/09.**
- Tiene que poder usarlo **cualquier compañero** para practicar para mañana.
- **Contenido del primer cuestionario**: la base son las preguntas reales del parcialito (PDF
  leído con capturas), más preguntas creadas por IA para **cubrir toda la teoría del TP1**,
  **ordenadas por dificultad** (no hace falta que las reales vayan primero), **siempre aclarando
  cuál es real y cuál de IA**.
- Tecnología: pensó en **React + TypeScript**, no Next (le parece overkill). Libertad para elegir.
- **A futuro puede escalar mucho**: base de datos, subir código y tener un **evaluador**, sumar
  **más materias e incluso otras carreras**.
- Quiere que el proyecto tenga su **`.claude`** con todo esto.
- Design system, paleta y estética: **sin preferencia por ahora**. Algo básico, lindo y acorde al
  contexto; después se acomoda y se arma una **skill de design system**.
- Quiere un doc en el repo con **lista de cosas a futuro**: skills, reglas, patrones de diseño,
  design system, paleta, qué se podría sumar. Le deja la elección a Claude: tomar lo que sirva y
  anotarlo o usarlo ya.
- "Una herramienta didáctica y dinámica para aprender bien la teoría de las materias en general,
  con dificultades, bibliografías y cosas así."
- **Todo lo que va diciendo se anota en este doc.**
- Repo en su **cuenta personal** de GitHub. Primero lo pidió privado; después cambió a
  **público** ("no pasa nada"), lo que habilita GitHub Pages gratis.
- El nombre "cuestionarios" le pareció poco creativo. Eligió **Tiza** entre Tiza, Libreta,
  Repasito y Machete.

### 2026-09-24 — primeros ajustes

- Sumar un link a su GitHub (https://github.com/FlorianLucchini) en el header, al lado del
  botón de modo día/noche.
- **Sacar por ahora todo lo que es bibliografía** del sitio. El campo `references` del modelo
  queda, opcional, para retomarlo más adelante.
