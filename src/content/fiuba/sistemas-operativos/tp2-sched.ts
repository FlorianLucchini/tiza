import type { Option, Quiz, Source } from '../../types'

const REAL: Source = { kind: 'real', exam: 'Parcialito TP2 · 2022a', answerVerified: false }
const AI: Source = { kind: 'ai' }

const LETTERS = 'abcdefgh'
const opts = (...texts: string[]): Option[] => texts.map((text, i) => ({ id: LETTERS[i], text }))
const TRUE_FALSE = opts('Verdadero', 'Falso')

export const tp2Sched: Quiz = {
  id: 'tp2-sched',
  title: 'Parcialito TP2 — Sched',
  description:
    'Toda la teoría del TP2: cambio de contexto e interrupciones en JOS, round robin con timer, sys_sleep, prioridades con aging y threads de usuario.',
  context:
    'No hay un parcialito real del TP2 sched. Las preguntas reales son del parcialito 2022a, cuando el TP2 era de kernel sobre JOS: comparte toda la parte de interrupciones y cambio de contexto. Es la copia de un alumno sin la corrección de la cátedra, así que sus respuestas están sin confirmar. El resto son preguntas generadas con IA a partir del enunciado y del esqueleto actuales.',
  questions: [
    // ---------------------------------------------------------------------
    // Real questions — Parcialito TP2 2022a (student's copy, not graded)
    // ---------------------------------------------------------------------
    {
      id: 'real-01',
      kind: 'single',
      prompt: '¿Cómo queda configurado el handler de la interrupción 75?\n\n`SETGATE(idt[75], 1, GD_KT, &handler_75, 3);`',
      options: opts(
        'Permite interrupciones anidadas. Permite interrupciones por software en modo usuario.',
        'No permite interrupciones anidadas. Permite interrupciones por software en modo usuario',
        'Permite interrupciones anidadas. No permite interrupciones por software en modo usuario',
        'No permite interrupciones anidadas. No permite interrupciones por software en modo usuario',
      ),
      answer: ['a'],
      explanation:
        'El segundo parámetro es `istrap`: con 1, `SETGATE` arma una *trap gate* (`STS_TG32`), que **no** apaga el flag `IF` al entrar, así que otra interrupción puede llegar mientras corre el handler. El último es el `dpl`: con 3, un proceso en ring 3 puede hacer `int $75`. Con `istrap = 0` sería una *interrupt gate* (apaga `IF`); con `dpl = 0`, un `int $75` desde usuario daría *general protection fault*.',
      difficulty: 2,
      source: REAL,
      topics: ['interrupciones', 'IDT'],
    },
    {
      id: 'real-02',
      kind: 'single',
      prompt: 'La instrucción `iret`...',
      options: opts(
        'Puede ser ejecutada en ring 3 para volver al kernel',
        'Cambia atómicamente el `eip`, el `cs` y todos los registros de propósito general',
        'Funciona igual que la instrucción `ret`',
        'Permite cambiar el stack que se está usando',
      ),
      answer: ['d'],
      explanation:
        '`iret` desapila `eip`, `cs` y `eflags`, y si cambia el nivel de privilegio también `esp` y `ss`: por eso cambia de stack (del de kernel al del proceso). Es lo que usa `context_switch`. No toca los registros de propósito general (hay que restaurarlos antes, con `popal`), no sirve para **entrar** al kernel (para eso están las interrupciones) y `ret` sólo desapila `eip`. *El alumno había marcado "funciona igual que `ret`".*',
      difficulty: 2,
      source: REAL,
      topics: ['cambio de contexto', 'iret'],
    },
    {
      id: 'real-03',
      kind: 'single',
      prompt: 'El formato y orden del `struct Trapframe` se define por:',
      options: opts(
        'Convención de JOS',
        'La arquitectura cuando se realiza un cambio de contexto',
        'La arquitectura cuando se realiza un cambio de contexto y JOS',
        'Ninguna de las anteriores',
      ),
      answer: ['c'],
      explanation:
        'Se ve en `inc/trap.h`: de `tf_err` en adelante (`tf_eip`, `tf_cs`, `tf_eflags`, `tf_esp`, `tf_ss`) lo apila el hardware al recibir la interrupción ("*below here defined by x86 hardware*"); `tf_err` lo pone la macro cuando la excepción no trae código de error. Los campos anteriores (`tf_regs`, `tf_es`, `tf_ds`, `tf_trapno`) los apilan las macros `TRAPHANDLER` y `_alltraps`, en el orden que eligió JOS.',
      difficulty: 2,
      source: REAL,
      topics: ['trapframe'],
    },
    {
      id: 'real-04',
      kind: 'single',
      prompt:
        'El anidamiento de interrupciones no se implementa en JOS porque no está el soporte en la arquitectura x86 para hacerlo',
      options: TRUE_FALSE,
      answer: ['b'],
      explanation:
        'x86 sí lo soporta: con una *trap gate* el flag `IF` queda prendido y otra interrupción puede llegar mientras corre el handler. JOS elige no anidar: configura todas sus entradas de la IDT como *interrupt gates* (`istrap = 0`), que apagan `IF` al entrar, y `trap()` lo verifica con `assert(!(read_eflags() & FL_IF))`.',
      difficulty: 2,
      source: REAL,
      topics: ['interrupciones'],
    },
    {
      id: 'real-05',
      kind: 'single',
      prompt:
        'El copiado del binario al espacio del proceso hijo se hace teniendo en `cr3` el "page directory" del mismo porque es la única forma de hacerlo',
      options: TRUE_FALSE,
      answer: ['b'],
      explanation:
        '`load_icode` carga el `env_pgdir` del proceso en `cr3` para poder hacer `memcpy` directo a las direcciones virtuales del programa, pero es la forma **cómoda**, no la única. El kernel tiene mapeada toda la memoria física arriba de `KERNBASE`: podría buscar la página física de cada destino y escribirla por su dirección de kernel, sin tocar `cr3`.',
      difficulty: 3,
      source: REAL,
      topics: ['memoria', 'ELF'],
    },
    {
      id: 'real-06',
      kind: 'single',
      prompt:
        'El formato del binario ELF tiene una parte fija de metadatos y una parte variable donde se definen cada uno de los "program headers"',
      options: TRUE_FALSE,
      answer: ['a'],
      explanation:
        'El *ELF header* tiene tamaño fijo y dice, entre otras cosas, dónde empieza la tabla de *program headers* y cuántos hay (`e_phnum`). Esa tabla es la parte variable: un *program header* por segmento a cargar. `load_icode` la recorre para copiar cada segmento a memoria.',
      difficulty: 1,
      source: REAL,
      topics: ['ELF'],
    },
    {
      id: 'real-07',
      kind: 'single',
      prompt: 'Sobre entrypoint donde arranca cada uno de los programas de usuario:',
      options: opts(
        'Es una constante definida por el kernel (UENTRY)',
        'Cada procceso de usuario la define al momento de compilarse',
        'El kernel calcula dinámicamente un nuevo entrypoint al momento de crear un proceso',
        'Está dado por la arquitectura',
      ),
      answer: ['b'],
      explanation:
        'El entry point es el campo `e_entry` del ELF, y lo fija el linker al compilar el programa (en JOS, `user/user.ld` define `ENTRY(_start)`). `load_icode` sólo lo copia: `e->env_tf.tf_eip = elf->e_entry`. No existe ninguna constante `UENTRY` en JOS. *El alumno había marcado `UENTRY`.*',
      difficulty: 2,
      source: REAL,
      topics: ['ELF', 'procesos'],
    },
    {
      id: 'real-08',
      kind: 'single',
      prompt: 'La dirección del stack en donde se tiene que ejecutar un "handler" de interrupción:',
      options: opts(
        'Es una constante definida por la arquitectura',
        'Es una constante que configura el kernel',
        'Es una variable que calcula el kernel al crear el proceso',
        'Es una variable que se calcula cuando se recibe la interrupción',
      ),
      answer: ['b'],
      explanation:
        'Al pasar de ring 3 a ring 0, el procesador toma el stack de kernel de la TSS (`ss0:esp0`). Lo configura el kernel una sola vez por CPU en `trap_init_percpu`: `ts_esp0 = KSTACKTOP - id * (KSTKGAP + KSTKSIZE)`. La arquitectura sólo dice **dónde buscarlo**, no cuánto vale; y no depende del proceso. *El alumno había marcado "constante definida por la arquitectura".*',
      difficulty: 3,
      source: REAL,
      topics: ['interrupciones', 'stack de kernel'],
    },
    {
      id: 'real-09',
      kind: 'single',
      prompt: '¿Cuál es el mecanismo por el que se implementan las syscalls en JOS?',
      options: opts(
        'Se utiliza instrucción privilegiada de x86 llamada `call_syscall`',
        'Como el kernel está en el pgdir del usuario, alcanza con una llamada a la función `syscall` del kernel desde userspace',
        'Se utiliza segmentación, el usuario cambia el valor del registro `cs` para "entrar" en el kernel (i.e. `mov $GD_KT %cs`)',
        'Se utiliza una interrupción generada por software',
      ),
      answer: ['d'],
      explanation:
        'El wrapper de `lib/syscall.c` hace `int $T_SYSCALL` (48). Que el kernel esté mapeado no alcanza para llamarlo: sus páginas no tienen `PTE_U`, así que un `call` desde ring 3 daría *page fault*. Y `cs` no se puede cambiar con un `mov`. La interrupción es la única entrada controlada: el kernel eligió el handler al armar la IDT.',
      difficulty: 1,
      source: REAL,
      topics: ['syscalls'],
    },
    {
      id: 'real-10',
      kind: 'single',
      prompt: 'Todo proceso de usuario tiene al kernel mappeado en su propio espacio de direcciones',
      options: TRUE_FALSE,
      answer: ['a'],
      explanation:
        '`env_setup_vm` arma el page directory del proceso copiando `kern_pgdir`: arriba de `ULIM` (el kernel propiamente dicho) todos los procesos ven lo mismo. Así, al entrar al kernel por una interrupción no hace falta cambiar `cr3`. Lo que protege al kernel son los permisos: sus páginas no tienen `PTE_U`.',
      difficulty: 1,
      source: REAL,
      topics: ['memoria'],
    },
    {
      id: 'real-11',
      kind: 'single',
      prompt: '¿Qué representan los valores `GD_KT`, `GD_KD`, `GD_UT` y `GD_UD`?',
      options: opts(
        'Son constantes que resuelven al número de ring (i.e. "3" o "0" donde corresponda)',
        'Son constantes definidas por la arquitectura, JOS sólo las usa',
        'Son índices en la tabla de segmentos global (gdt), configurada por JOS',
        'Son índices en la tabla de segmentos de interrupciones (idt), configurada por JOS',
      ),
      answer: ['c'],
      explanation:
        'Son selectores de segmento de la GDT que arma JOS: `GD_KT = 0x08` (código de kernel), `GD_KD = 0x10`, `GD_UT = 0x18`, `GD_UD = 0x20`. El ring no está en la constante: se le suma después en los 2 bits bajos (por eso `env_alloc` hace `GD_UT | 3`). La IDT es la tabla de interrupciones, no de segmentos.',
      difficulty: 2,
      source: REAL,
      topics: ['segmentación'],
    },
    {
      id: 'real-12',
      kind: 'single',
      prompt: '¿Por qué, conceptualmente, es necesario tener dos macros: `TRAPHANDLER_NOEC` y `TRAPHANDLER`?',
      options: opts(
        'Para distinguir entre interrupciones por hardware e interrupciones por software',
        'Para distinguir entre excepciones e interrupciones',
        'Porque algunas interrupciones tienen un código de error asociado',
        'Porque algunas interrupciones no son recuperables (e.g. división por zero)',
      ),
      answer: ['c'],
      explanation:
        'Para algunas excepciones (*page fault*, *general protection*…) el procesador apila un código de error; para el resto no. `TRAPHANDLER_NOEC` apila un 0 en su lugar, así el `Trapframe` tiene siempre el mismo formato y `_alltraps` puede ser una sola. Por ejemplo, `trap14` (*page fault*) usa `TRAPHANDLER` y `trap32` (timer) usa `TRAPHANDLER_NOEC`.',
      difficulty: 1,
      source: REAL,
      topics: ['trapframe', 'interrupciones'],
    },
    {
      id: 'real-13',
      kind: 'single',
      prompt: '¿Dónde almacena la arquitectura x86 el nivel de priviegio actual?',
      options: opts('En el registro `eflags`', 'En la idt', 'En el registro cpl', 'En el registro `cs`'),
      answer: ['d'],
      explanation:
        'El CPL son los 2 bits bajos del selector cargado en `cs`. Así sabe `trap()` de dónde viene la interrupción: `if ((tf->tf_cs & 3) == 3)` significa que el proceso estaba en modo usuario. No existe un registro "cpl".',
      difficulty: 2,
      source: REAL,
      topics: ['privilegios'],
    },
    {
      id: 'real-14',
      kind: 'single',
      prompt:
        'Para pasar del kernel al proceso de usuario se realiza un move del "entry point" del binario asociado, al registro "eip" (e.j: `mov entry_poiny, %eip`)',
      options: TRUE_FALSE,
      answer: ['b'],
      explanation:
        '`eip` no se puede escribir con `mov`, y aunque se pudiera, faltaría cambiar `cs` (el ring), `esp` y `eflags` a la vez. Por eso se usa `iret`: `load_icode` deja el entry point en `tf_eip` y `context_switch` lo carga, junto con el resto, al hacer `iret`.',
      difficulty: 1,
      source: REAL,
      topics: ['cambio de contexto', 'iret'],
    },
    {
      id: 'real-15',
      kind: 'single',
      prompt:
        'Si en un proceso de usuario, se realiza una desrrefencia de un puntero a una dirección que no está mapeada, el mecanismo que genera la excepción es:',
      options: opts(
        'El kernel por medio de `user_mem_check`',
        'La MMU',
        'La librería de usuario lo chequea y genera una interrupción por software',
        'El compilador, al generar el programa de usuario',
      ),
      answer: ['b'],
      explanation:
        'La traducción de direcciones la hace la MMU en hardware: si no encuentra la página, genera un *page fault* (excepción 14) y el kernel recién se entera en `page_fault_handler`. `user_mem_check` es para otra cosa: validar punteros que el usuario le **pasa** al kernel en una syscall.',
      difficulty: 1,
      source: REAL,
      topics: ['memoria', 'interrupciones'],
    },

    // ---------------------------------------------------------------------
    // AI-generated questions — cover the rest of the TP2 sched statement
    // ---------------------------------------------------------------------

    // Part 1 — context switch
    {
      id: 'ai-01',
      kind: 'single',
      prompt: '¿Qué función del esqueleto restaura los registros de un environment y pasa la CPU a modo usuario?',
      options: opts('`_alltraps`', '`trap`', '`context_switch`', '`sched_yield`'),
      answer: ['c'],
      explanation:
        '`context_switch` (en `kern/switch.S`) recibe un puntero al `Trapframe`, restaura los registros y termina en `iret`, que pasa a ring 3. `_alltraps` hace el camino inverso (de usuario al kernel), `trap` decide qué hacer con la interrupción y `sched_yield` elige el próximo proceso.',
      difficulty: 1,
      source: AI,
      topics: ['cambio de contexto'],
    },
    {
      id: 'ai-02',
      kind: 'single',
      prompt: '`context_switch`…',
      options: opts(
        'Retorna a `env_run` cuando el proceso hace una syscall',
        'No retorna nunca: termina con `iret` y la CPU sigue ejecutando código de usuario',
        'Retorna a `sched_yield` cuando vence el *quantum*',
        'Retorna cuando el proceso termina, para que `env_run` lo libere',
      ),
      answer: ['b'],
      explanation:
        'Después del `iret` la CPU está en el código del proceso. La vuelta al kernel es **otra** entrada, por una interrupción (syscall, timer, excepción), que arranca de cero en `_alltraps` con el stack de kernel vacío. Por eso `env_run` tiene un `panic` después de llamarla: nunca debería llegar ahí.',
      difficulty: 1,
      source: AI,
      topics: ['cambio de contexto'],
    },
    {
      id: 'ai-03',
      kind: 'multiple',
      prompt: '¿Qué tiene que hacer `env_run(e)` antes de llamar a `context_switch`?',
      options: opts(
        'Pasar a `ENV_RUNNABLE` al `curenv` anterior, si estaba `ENV_RUNNING`',
        'Actualizar `curenv` y marcar a `e` como `ENV_RUNNING`',
        'Copiar el `Trapframe` del stack a `e->env_tf`',
        'Incrementar `e->env_runs`',
        'Cargar el page directory de `e` con `env_load_pgdir`',
      ),
      answer: ['a', 'b', 'd', 'e'],
      explanation:
        'Son los pasos que pide el enunciado y el comentario de `env_run`. Copiar el `Trapframe` a `env_tf` es al revés: lo hace `trap()` cuando el proceso **entra** al kernel, para poder retomarlo después. `env_run` usa ese `env_tf` ya guardado.',
      difficulty: 2,
      source: AI,
      topics: ['cambio de contexto', 'env_run'],
    },
    {
      id: 'ai-04',
      kind: 'multiple',
      prompt: 'Al ejecutar `iret` para pasar de ring 0 a ring 3, ¿qué registros carga el procesador desde el stack?',
      options: opts('`eip`', '`cs`', '`eflags`', '`esp` y `ss`', '`eax`', '`cr3`'),
      answer: ['a', 'b', 'c', 'd'],
      explanation:
        '`iret` desapila `eip`, `cs` y `eflags`, y como el ring cambia (el `cs` nuevo tiene RPL 3), también `esp` y `ss`. Los de propósito general como `eax` no los toca: se restauran antes con `popal`. `cr3` no está en el `Trapframe`: el espacio de direcciones lo cambia `env_run` con `env_load_pgdir`.',
      difficulty: 2,
      source: AI,
      topics: ['iret', 'cambio de contexto'],
    },
    {
      id: 'ai-05',
      kind: 'single',
      prompt:
        '`context_switch` recibe el puntero al `Trapframe` como argumento. ¿Cuál de estas secuencias restaura bien el estado?',
      options: opts(
        '`popal` · `mov 4(%esp), %esp` · `pop %es` · `pop %ds` · `iret`',
        '`mov 4(%esp), %esp` · `pop %ds` · `pop %es` · `popal` · `add $8, %esp` · `iret`',
        '`mov 4(%esp), %esp` · `popal` · `pop %es` · `pop %ds` · `iret`',
        '`mov 4(%esp), %esp` · `popal` · `pop %es` · `pop %ds` · `add $8, %esp` · `iret`',
      ),
      answer: ['d'],
      explanation:
        'Primero `esp` pasa a apuntar al `Trapframe` (el argumento está en `4(%esp)`). Después se desapila en el orden del struct, desde la dirección más baja: `tf_regs` (`popal`), `tf_es`, `tf_ds`. Quedan `tf_trapno` y `tf_err`, que no son registros: `add $8` los saltea para que el tope sea `tf_eip`, lo que espera `iret`. Sin ese `add`, `iret` tomaría el número de trap como `eip`.',
      difficulty: 3,
      source: AI,
      topics: ['cambio de contexto', 'trapframe'],
    },
    {
      id: 'ai-06',
      kind: 'single',
      prompt: '¿Por qué `context_switch` tiene que restaurar `eax`, `ebx`, `esi`, etc. **antes** del `iret`?',
      options: opts(
        'Porque `iret` los pone en cero',
        'Porque `iret` sólo carga `eip`, `cs`, `eflags`, `esp` y `ss`; después de él ya se está ejecutando código de usuario',
        'Porque son registros privilegiados que sólo se pueden escribir en ring 0',
        'No hace falta: el proceso los restaura solo al retomar',
      ),
      answer: ['b'],
      explanation:
        'Lo dice el enunciado: "el resto de los registros definidos en `struct Trapframe` deben ser restaurados previamente, dado que `iret` no los modifica". Una vez hecho el `iret`, la próxima instrucción ya es del proceso, y el kernel no tiene más oportunidad de tocarlos.',
      difficulty: 1,
      source: AI,
      topics: ['cambio de contexto', 'iret'],
    },
    {
      id: 'ai-07',
      kind: 'single',
      prompt: '`_alltraps` tiene que dejar un `struct Trapframe` completo en el stack. ¿En qué orden apila lo que falta?',
      options: opts(
        '`pushal`, después `%es`, después `%ds`',
        '`%ds`, después `%es`, después `pushal`',
        '`%es`, después `%ds`, después `pushal`',
        'Da igual el orden, `trap` lo reacomoda',
      ),
      answer: ['b'],
      explanation:
        'El stack crece hacia direcciones bajas, y el struct se lee desde la dirección más baja. Así que lo último que se apila queda primero en el struct. El orden del struct es `tf_regs`, `tf_es`, `tf_ds`, `tf_trapno`…; como `tf_trapno` ya lo apiló la macro, faltan `%ds`, `%es` y por último `pushal` (que deja `tf_regs` al principio).',
      difficulty: 2,
      source: AI,
      topics: ['trapframe', 'interrupciones'],
    },
    {
      id: 'ai-08',
      kind: 'single',
      prompt: 'Justo antes del `call trap`, `_alltraps` hace `pushl %esp`. ¿Para qué?',
      options: opts(
        'Para guardar el stack del usuario',
        'Para que `iret` sepa a dónde volver',
        'Para alinear el stack a 8 bytes',
        'Para pasarle a `trap` el puntero al `Trapframe`, que está en el tope del stack',
      ),
      answer: ['d'],
      explanation:
        '`trap(struct Trapframe *tf)` recibe un puntero, y por convención de C en x86 los argumentos van en el stack. En ese momento `esp` apunta justo al comienzo del `Trapframe` recién armado, así que apilar `esp` es pasar ese puntero.',
      difficulty: 2,
      source: AI,
      topics: ['trapframe', 'interrupciones'],
    },
    {
      id: 'ai-09',
      kind: 'single',
      prompt:
        'Además de apilar, `_alltraps` carga `GD_KD` en `%ds` y `%es` antes de llamar a `trap`. ¿Por qué hace falta?',
      options: opts(
        'Porque al entrar por la interrupción el procesador cambia `cs` y `ss`, pero `ds` y `es` siguen con lo que dejó el proceso',
        'Porque `GD_KD` desactiva las interrupciones',
        'Porque así el hardware sabe que tiene que apilar el código de error',
        'No hace falta: el procesador ya los carga desde la IDT',
      ),
      answer: ['a'],
      explanation:
        'La IDT da el `cs` del handler (`GD_KT`) y la TSS da `ss0` (`GD_KD`), pero nadie toca `ds` ni `es`: quedan con el valor que dejó el proceso, que no es confiable (en ring 3 puede cargar hasta un selector nulo, y el primer acceso a datos del kernel daría *general protection fault*). Por eso `_alltraps` los fija al segmento de datos de kernel antes de ejecutar C.',
      difficulty: 3,
      source: AI,
      topics: ['trapframe', 'segmentación'],
    },
    {
      id: 'ai-10',
      kind: 'multiple',
      prompt: 'Un proceso en ring 3 recibe la interrupción del timer. ¿Qué apila **el hardware** antes de saltar a `trap32`?',
      options: opts(
        '`ss` y `esp` del usuario',
        '`eflags`',
        '`cs` y `eip`',
        'Un código de error',
        'El número de interrupción (32)',
      ),
      answer: ['a', 'b', 'c'],
      explanation:
        'Al cambiar de ring, el procesador pasa al stack de kernel y apila `ss`, `esp`, `eflags`, `cs` y `eip`. El timer no tiene código de error: por eso `trap32` usa `TRAPHANDLER_NOEC`, que apila un 0 en su lugar. El número de interrupción tampoco lo apila el hardware: lo apila la macro (`pushl $(num)`).',
      difficulty: 2,
      source: AI,
      topics: ['trapframe', 'interrupciones', 'timer'],
    },
    {
      id: 'ai-11',
      kind: 'single',
      prompt: 'Según `inc/trap.h`, ¿cuándo apila el hardware los campos `tf_esp` y `tf_ss`?',
      options: opts(
        'Siempre, en cualquier interrupción',
        'Sólo en las excepciones con código de error',
        'Sólo cuando la interrupción cruza de ring, por ejemplo de usuario a kernel',
        'Nunca: los apila `_alltraps`',
      ),
      answer: ['c'],
      explanation:
        'El comentario del struct lo dice: "*below here only when crossing rings*". Si la interrupción llega estando ya en ring 0, el procesador sigue en el mismo stack y no tiene que guardar uno anterior. Por eso un `Trapframe` de una interrupción en modo kernel es más corto.',
      difficulty: 2,
      source: AI,
      topics: ['trapframe'],
    },
    {
      id: 'ai-12',
      kind: 'single',
      prompt: 'Cuando el proceso entra al kernel, `trap()` hace `curenv->env_tf = *tf`. ¿Para qué?',
      options: opts(
        'Para que `trap_dispatch` pueda leer el número de syscall',
        'Para guardar el estado del proceso fuera del stack de kernel, que se va a reutilizar en la próxima interrupción, y poder retomarlo después con `env_run`',
        'Para liberar el stack del usuario',
        'Para que `iret` vuelva a la instrucción siguiente',
      ),
      answer: ['b'],
      explanation:
        'El `Trapframe` que armó `_alltraps` vive en el stack de kernel, que es uno solo por CPU: la próxima interrupción lo pisa. Copiándolo al PCB del proceso, el scheduler puede cambiar a otro proceso y, más adelante, `env_run` retoma éste desde `env_tf` justo donde se interrumpió.',
      difficulty: 2,
      source: AI,
      topics: ['trapframe', 'cambio de contexto'],
    },
    {
      id: 'ai-13',
      kind: 'single',
      prompt: 'En GDB, con un breakpoint en `trap` disparado por el timer mientras corría un proceso, ¿qué se espera ver?',
      options: opts(
        '`tf->tf_trapno == 48` y `tf->tf_cs == 0x08`',
        '`tf->tf_trapno == 0` y `tf->tf_cs == 0x1b`',
        '`tf->tf_trapno == 32` y `tf->tf_cs == 0x08`',
        '`tf->tf_trapno == 32` y `tf->tf_cs == 0x1b`',
      ),
      answer: ['d'],
      explanation:
        'El timer es la IRQ 0, que JOS recibe en el vector `IRQ_OFFSET + IRQ_TIMER = 32`. El 48 es `T_SYSCALL`. `tf_cs` es el `cs` **del proceso interrumpido**: `GD_UT | 3 = 0x18 | 3 = 0x1b`. `0x08` (`GD_KT`) indicaría que la interrupción llegó en modo kernel.',
      difficulty: 3,
      source: AI,
      topics: ['GDB', 'timer', 'trapframe'],
    },
    {
      id: 'ai-14',
      kind: 'single',
      prompt: 'En JOS, ¿dónde deja el kernel el valor de retorno de una syscall para que lo vea el proceso?',
      options: opts(
        'En `tf_regs.reg_eax` del `Trapframe` del proceso, que `context_switch` restaura en `eax`',
        'En el stack del usuario',
        'En una variable global de la libc',
        'En `tf_regs.reg_edx`, porque `eax` tiene el número de syscall',
      ),
      answer: ['a'],
      explanation:
        'El wrapper pasa el número en `eax` y los argumentos en `edx`, `ecx`, `ebx`, `edi` y `esi`. Del lado del kernel, `trap_dispatch` hace `tf->tf_regs.reg_eax = syscall(...)`: el resultado pisa el número en el `Trapframe`, y al volver a usuario `popal` lo carga en `eax`.',
      difficulty: 1,
      source: AI,
      topics: ['syscalls'],
    },
    {
      id: 'ai-15',
      kind: 'single',
      prompt: 'Un programa de usuario ejecuta `int $32` (el vector del timer). ¿Qué pasa?',
      options: opts(
        'El kernel lo toma como un tick y llama al scheduler',
        'Se genera una *general protection fault*, porque esa entrada de la IDT tiene `dpl = 0`',
        'Nada: las interrupciones de hardware no se pueden generar por software',
        'Se ejecuta la syscall número 32',
      ),
      answer: ['b'],
      explanation:
        'En `trap_init`, el timer se configura con `SETGATE(idt[IRQ_OFFSET + IRQ_TIMER], 0, GD_KT, &trap32, 0)`. Con `dpl = 0`, un `int` desde ring 3 no está permitido y el procesador genera la excepción 13. Sólo las entradas de syscall (48) y breakpoint (3) tienen `dpl = 3`. El chequeo de `dpl` aplica a `int`, no a la interrupción real del hardware.',
      difficulty: 3,
      source: AI,
      topics: ['IDT', 'privilegios', 'timer'],
    },
    {
      id: 'ai-16',
      kind: 'single',
      prompt: 'Mientras el kernel de JOS ejecuta `trap()`, ¿por qué no lo puede interrumpir el timer?',
      options: opts(
        'Porque el timer sólo cuenta cuando corre un proceso',
        'Porque el kernel tiene más prioridad que el timer',
        'Porque `lock_kernel` desactiva el timer',
        'Porque todas las entradas de la IDT son *interrupt gates*: el procesador apaga `IF` al entrar y el kernel corre con interrupciones deshabilitadas',
      ),
      answer: ['d'],
      explanation:
        'JOS usa `istrap = 0` en todos sus `SETGATE`, y `trap()` lo verifica: `assert(!(read_eflags() & FL_IF))`. Las interrupciones vuelven a estar habilitadas recién al volver a usuario, porque `iret` restaura un `eflags` con `FL_IF` prendido (o en `sched_halt`, que hace `sti` antes del `hlt`). El *big kernel lock* es para varias CPUs, no apaga el timer.',
      difficulty: 2,
      source: AI,
      topics: ['interrupciones', 'timer'],
    },
    {
      id: 'ai-17',
      kind: 'single',
      prompt:
        'Supongamos que `env_alloc` no hiciera `e->env_tf.tf_eflags |= FL_IF`. ¿Qué pasaría con `user/spin` (un hijo que hace `while(1)` sin ceder la CPU)?',
      options: opts(
        'Nada distinto: el timer interrumpe igual',
        'El hijo daría *general protection fault* al arrancar',
        'El hijo correría para siempre: con las interrupciones deshabilitadas en usuario, el timer nunca lo saca',
        'El kernel daría *triple fault*',
      ),
      answer: ['c'],
      explanation:
        'El `eflags` que restaura `iret` sale de `env_tf`. Sin `FL_IF`, el proceso corre con interrupciones enmascaradas y el timer no llega nunca: sólo volvería al kernel si hiciera una syscall o causara una excepción. Un `while(1)` vacío no hace ninguna de las dos.',
      difficulty: 3,
      source: AI,
      topics: ['timer', 'preemption'],
    },

    // Part 2 — round robin, timer and sys_sleep
    {
      id: 'ai-18',
      kind: 'single',
      prompt: '¿Qué le permite al scheduler de la Parte 2 sacarle la CPU a un proceso que nunca hace syscalls?',
      options: opts(
        'La interrupción periódica del *timer* del LAPIC (`IRQ_TIMER`)',
        'Que `sched_yield` corre en un thread aparte',
        'Que la libc llama a `sys_yield` cada tanto',
        'Que cada proceso tiene un tiempo máximo en su `struct Env`',
      ),
      answer: ['a'],
      explanation:
        'Es la *preemption*: el timer interrumpe al proceso sin que éste coopere, el kernel recupera el control y en el caso `IRQ_TIMER` de `trap_dispatch` llama a `sched_yield`. En la Parte 1 el kernel sólo volvía a correr cuando el proceso hacía una syscall.',
      difficulty: 1,
      source: AI,
      topics: ['preemption', 'timer'],
    },
    {
      id: 'ai-19',
      kind: 'single',
      prompt: '¿Cuál es el camino desde la interrupción del timer hasta que corre otro proceso?',
      options: opts(
        '`sched_yield` → `trap32` → `trap` → `env_run`',
        '`trap32` → `_alltraps` → `trap` → `trap_dispatch` → `sched_yield` → `env_run` → `context_switch`',
        '`_alltraps` → `trap32` → `sched_yield` → `trap` → `context_switch`',
        '`trap_dispatch` → `trap32` → `_alltraps` → `env_run`',
      ),
      answer: ['b'],
      explanation:
        'El hardware salta al handler de la IDT (`trap32`), que apila el error falso y el número, y va a `_alltraps`. Ésta completa el `Trapframe` y llama a `trap`, que lo guarda en `curenv->env_tf` y llama a `trap_dispatch`. En el caso `IRQ_TIMER` se llama a `sched_yield`, que elige otro proceso y hace `env_run`, que termina en `context_switch`.',
      difficulty: 2,
      source: AI,
      topics: ['preemption', 'timer', 'interrupciones'],
    },
    {
      id: 'ai-20',
      kind: 'single',
      prompt: 'En el caso `IRQ_TIMER` de `trap_dispatch`, ¿en qué orden van las cosas?',
      options: opts(
        '`sched_yield()`, `ticks++`, `lapic_eoi()`, `sched_wakeup_sleeping()`',
        '`ticks++`, `sched_yield()`, `sched_wakeup_sleeping()`, `lapic_eoi()`',
        '`lapic_eoi()`, `ticks++`, `sched_wakeup_sleeping()`, `sched_yield()`',
        '`sched_wakeup_sleeping()`, `lapic_eoi()`, `sched_yield()`, `ticks++`',
      ),
      answer: ['c'],
      explanation:
        'Es lo que piden el comentario de `trap_dispatch` y el de `sched_wakeup_sleeping`. Despertar va antes de `sched_yield` para que los que se despiertan ya sean candidatos en esta decisión. Y `sched_yield` va último porque no retorna: lo que esté después no se ejecuta nunca.',
      difficulty: 2,
      source: AI,
      topics: ['timer', 'sleep'],
    },
    {
      id: 'ai-21',
      kind: 'single',
      prompt: 'En el *round robin* del TP, ¿dónde arranca `sched_yield` a buscar el próximo proceso?',
      options: opts(
        'Siempre en `envs[0]`',
        'Justo después del último environment que corrió en esta CPU, recorriendo `envs` en forma circular',
        'En el environment con menor `env_id`',
        'En uno elegido al azar',
      ),
      answer: ['b'],
      explanation:
        'Si siempre arrancara en `envs[0]`, los primeros del arreglo se llevarían la CPU y los últimos casi nunca correrían. Arrancando después del último que corrió y dando la vuelta completa, todos reciben su turno: eso es lo que hace "justo" al *round robin*.',
      difficulty: 1,
      source: AI,
      topics: ['round robin'],
    },
    {
      id: 'ai-22',
      kind: 'single',
      prompt:
        'Corre un solo proceso. Llega el timer y `sched_yield` no encuentra ningún environment `ENV_RUNNABLE`. ¿Qué tiene que hacer?',
      options: opts(
        'Volver a elegir al proceso actual, porque sigue `ENV_RUNNING` en esta CPU',
        'Llamar a `sched_halt` y dejar la CPU *idle*',
        'Imprimir las estadísticas y terminar',
        'Destruir al proceso actual',
      ),
      answer: ['a'],
      explanation:
        'El proceso que estaba corriendo está `ENV_RUNNING`, no `ENV_RUNNABLE`, así que el recorrido no lo encuentra. El enunciado lo prevé: "si no hay ninguno y el proceso que se estaba ejecutando sigue en ejecución, se lo puede volver a elegir". Sólo si tampoco está ése se cae en `sched_halt`.',
      difficulty: 2,
      source: AI,
      topics: ['round robin'],
    },
    {
      id: 'ai-23',
      kind: 'single',
      prompt:
        'Con varias CPUs (`make grade` corre algunas pruebas con `CPUS=2` y `CPUS=4`), ¿por qué `sched_yield` no puede elegir un environment que esté `ENV_RUNNING`, salvo el propio `curenv`?',
      options: opts(
        'Porque `ENV_RUNNING` significa que el proceso está muerto',
        'Porque está corriendo en otra CPU: lo ejecutarían dos CPUs a la vez con el mismo stack y el mismo `env_tf`',
        'Porque perdería la prioridad',
        'Porque `env_run` sólo acepta procesos `ENV_FREE`',
      ),
      answer: ['b'],
      explanation:
        'Un environment es un solo hilo de ejecución: corrido en dos CPUs a la vez, las dos escribirían el mismo stack de usuario y el kernel guardaría en el mismo `env_tf` dos estados distintos. El comentario de `sched_yield` lo pide explícitamente.',
      difficulty: 3,
      source: AI,
      topics: ['round robin', 'multiprocesador'],
    },
    {
      id: 'ai-24',
      kind: 'multiple',
      prompt: '¿Qué tiene que hacer `sys_sleep(n)`?',
      options: opts(
        'Marcar al proceso como `ENV_NOT_RUNNABLE`',
        'Guardar en `env_sleep_until` el tick en el que tiene que despertarse (`ticks + n`)',
        'Quedarse en un loop dentro del kernel hasta que `ticks` llegue al valor',
        'Dejar el valor de retorno en el `Trapframe` del proceso y llamar al scheduler',
        'Liberar el environment y recrearlo al despertar',
      ),
      answer: ['a', 'b', 'd'],
      explanation:
        'El proceso deja de ser elegible y anota cuándo despertarse. `sched_wakeup_sleeping`, en cada tick, lo vuelve a `ENV_RUNNABLE`. Esperar en un loop dentro del kernel bloquearía la CPU (con interrupciones apagadas, ni siquiera avanzaría `ticks`). Y el proceso tiene que conservar su estado para seguir después del `sys_sleep`.',
      difficulty: 2,
      source: AI,
      topics: ['sleep', 'syscalls'],
    },
    {
      id: 'ai-25',
      kind: 'single',
      prompt:
        '`sys_sleep` llama al scheduler y por eso "no retorna". ¿Por qué tiene que guardar ella misma su valor de retorno en `curenv->env_tf.tf_regs.reg_eax`?',
      options: opts(
        'Porque `eax` es el único registro que conserva `iret`',
        'Porque `sched_yield` pone `eax` en cero',
        'Porque la asignación `tf->tf_regs.reg_eax = syscall(...)` de `trap_dispatch` nunca se ejecuta: `syscall` no vuelve',
        'No hace falta: el valor de retorno de una syscall que duerme se ignora',
      ),
      answer: ['c'],
      explanation:
        'Normalmente el resultado lo guarda `trap_dispatch` cuando `syscall()` retorna. Pero `sys_sleep` termina en `sched_yield`, que nunca vuelve, y esa línea no se ejecuta. Cuando el proceso se despierta, `context_switch` restaura `eax` desde `env_tf`, así que el valor tiene que estar ahí. El esqueleto sugiere mirar cómo lo resuelven `sys_ipc_recv` y `sys_ipc_try_send`.',
      difficulty: 3,
      source: AI,
      topics: ['sleep', 'syscalls'],
    },
    {
      id: 'ai-26',
      kind: 'single',
      prompt:
        'Todos los procesos vivos duermen a la vez. Con la condición original de `sched_halt` (que sólo busca `ENV_RUNNABLE`, `ENV_RUNNING` o `ENV_DYING`), ¿qué pasa?',
      options: opts(
        'La CPU espera al timer y los procesos se despiertan bien',
        'Los procesos dormidos se despiertan en el acto',
        'El kernel entra en *triple fault*',
        'El kernel cree que no queda nadie vivo: imprime las estadísticas y cae en el monitor, aunque el timer iba a despertar a alguien',
      ),
      answer: ['d'],
      explanation:
        'Un proceso dormido está `ENV_NOT_RUNNABLE`, así que la búsqueda no lo encuentra y el kernel termina. Hay que distinguir "no hay nada que ejecutar **por ahora**" (esperar al timer con `hlt`) de "no queda ningún proceso vivo" (recién ahí, estadísticas y monitor). Es la advertencia del enunciado y del comentario de `sched_halt`.',
      difficulty: 3,
      source: AI,
      topics: ['sleep', 'sched_halt'],
    },
    {
      id: 'ai-27',
      kind: 'single',
      prompt: '¿Por qué hay que inicializar `env_sleep_until` en `env_alloc`?',
      options: opts(
        'Porque las entradas de `envs` se reciclan: un proceso nuevo heredaría el valor de un proceso anterior que usó ese slot',
        'Porque `memset` borra todo el `struct Env` salvo ese campo',
        'Porque si no, el compilador da *warning*',
        'Porque `sys_sleep` sólo funciona con valores impares',
      ),
      answer: ['a'],
      explanation:
        '`env_alloc` toma un slot de la *free list* y resetea algunos campos, pero el `memset` es sólo de `env_tf`. Si un proceso murió dormido o con un valor viejo, el nuevo arrastraría ese `env_sleep_until`. Pasa lo mismo con `env_priority` y `env_wait_ticks` en la Parte 3.',
      difficulty: 2,
      source: AI,
      topics: ['sleep', 'procesos'],
    },
    {
      id: 'ai-28',
      kind: 'single',
      prompt: 'Cuando no hay nada para ejecutar pero quedan procesos vivos, ¿qué hace `sched_halt`?',
      options: opts(
        'Un loop que llama a `sched_yield` sin parar',
        'Libera el lock del kernel, habilita interrupciones (`sti`) y ejecuta `hlt`: la CPU espera a la próxima interrupción del timer',
        'Reinicia la máquina',
        'Corre el monitor del kernel hasta que alguien escriba `continue`',
      ),
      answer: ['b'],
      explanation:
        'Es el estado *idle*. Marca la CPU como `CPU_HALTED`, pone `curenv = NULL`, carga `kern_pgdir` y, con un stack limpio, hace `sti; hlt`. Cuando llega el timer, `trap` ve el `CPU_HALTED`, retoma el lock y el scheduler vuelve a buscar. El monitor queda sólo para cuando ya no queda ningún proceso.',
      difficulty: 2,
      source: AI,
      topics: ['sched_halt'],
    },
    {
      id: 'ai-29',
      kind: 'single',
      prompt:
        'Un proceso hace una syscall que no bloquea (por ejemplo, `sys_getenvid`). ¿Cómo vuelve a modo usuario?',
      options: opts(
        'Siempre pasa por `sched_yield`, que lo vuelve a elegir',
        'Por `env_pop_tf`, sin pasar por `env_run`',
        'Al final de `trap()`: como sigue `ENV_RUNNING`, se llama directo a `env_run(curenv)`, sin pasar por el scheduler',
        'Por un `ret` desde `syscall()`',
      ),
      answer: ['c'],
      explanation:
        'Las últimas líneas de `trap()`: `if (curenv && curenv->env_status == ENV_RUNNING) env_run(curenv); else sched_yield();`. Por eso, si se cuenta cada `env_run`, un proceso puede sumar más "ejecuciones" que las veces que el scheduler lo eligió: conviene aclarar en el informe qué mide cada número.',
      difficulty: 3,
      source: AI,
      topics: ['estadísticas', 'syscalls'],
    },
    {
      id: 'ai-30',
      kind: 'single',
      prompt:
        'Con `user/spin`, se comenta la llamada a `sched_yield()` en el caso `IRQ_TIMER`. ¿Qué se observa?',
      options: opts(
        'Lo mismo que antes: el padre mata al hijo',
        'El padre nunca vuelve a correr y no aparece "Killing the child...": el kernel queda trabado en el hijo',
        'El hijo termina solo',
        'El kernel da *panic* en la primera interrupción',
      ),
      answer: ['b'],
      explanation:
        'El timer sigue interrumpiendo, pero sin `sched_yield` el kernel vuelve siempre al mismo proceso. El hijo hace `while(1)` sin syscalls, así que no cede nunca. Con *preemption*, el padre recupera la CPU y lo mata: la diferencia la hace sólo el timer, no la cooperación del hijo.',
      difficulty: 2,
      source: AI,
      topics: ['preemption', 'timer'],
    },
    {
      id: 'ai-31',
      kind: 'multiple',
      prompt: '¿Qué estadísticas pide imprimir el enunciado de la Parte 2 en `sched_halt`?',
      options: opts(
        'Número total de llamadas al scheduler',
        'Número de veces que se ejecutó cada proceso',
        'Tiempo total de ejecución en ticks',
        'La prioridad efectiva de cada proceso',
        'El historial de los últimos N procesos ejecutados',
      ),
      answer: ['a', 'b', 'c'],
      explanation:
        'Esas tres son de la Parte 2. El historial de los últimos N y la distribución de CPU por prioridad se agregan en la Parte 3. Se imprimen cuando ya no queda ningún proceso vivo, no cada vez que la CPU queda *idle*.',
      difficulty: 1,
      source: AI,
      topics: ['estadísticas'],
    },

    // Part 3 — priorities and aging
    {
      id: 'ai-32',
      kind: 'single',
      prompt: '¿Qué es *starvation* en un scheduler con prioridades?',
      options: opts(
        'Que un proceso se quede sin memoria',
        'Que un proceso de baja prioridad no obtenga nunca la CPU porque siempre hay otro de mayor prioridad listo',
        'Que el scheduler se quede sin procesos para elegir',
        'Que dos procesos se bloqueen esperándose mutuamente',
      ),
      answer: ['b'],
      explanation:
        'Es el problema de una política puramente por prioridades: mientras haya procesos más prioritarios listos, el postergado espera indefinidamente. Dos procesos que se esperan mutuamente es un *deadlock*, otra cosa.',
      difficulty: 1,
      source: AI,
      topics: ['prioridades', 'starvation'],
    },
    {
      id: 'ai-33',
      kind: 'single',
      prompt: '¿Cómo evita el *aging* la *starvation*?',
      options: opts(
        'Bajándole la prioridad base a los procesos que corren mucho',
        'Matando a los procesos que esperan demasiado',
        'Sumándole a la prioridad un bonus que crece con el tiempo que el proceso lleva esperando: tarde o temprano supera a los demás',
        'Alternando entre round robin y prioridades cada N ticks',
      ),
      answer: ['c'],
      explanation:
        'El enunciado define `prioridad_efectiva = env_priority + aging_bonus(espera acumulada)`. Como el bonus crece mientras el proceso no es elegido, en algún momento su prioridad efectiva supera a la de cualquier otro y le toca. Ese "en algún momento" es el peor caso que hay que calcular para el informe.',
      difficulty: 1,
      source: AI,
      topics: ['aging', 'starvation'],
    },
    {
      id: 'ai-34',
      kind: 'single',
      prompt: 'Con *aging*, ¿qué pasa con `env_priority`?',
      options: opts(
        'El *aging* la va incrementando de a uno',
        'Se resetea cada vez que el proceso corre',
        'El *aging* la baja a los procesos que más corrieron',
        'No cambia: es la prioridad **base**, y el bonus vive en la prioridad efectiva, que se recalcula en cada decisión',
      ),
      answer: ['d'],
      explanation:
        'Es la pista del enunciado. Por eso unas estadísticas que sólo muestren `env_priority` se ven igual en una corrida donde el *aging* fue decisivo y en una donde nunca actuó: para que se note, hay que registrar la prioridad efectiva o las decisiones que tomó.',
      difficulty: 2,
      source: AI,
      topics: ['aging', 'estadísticas'],
    },
    {
      id: 'ai-35',
      kind: 'multiple',
      prompt:
        'Las prioridades válidas van de 0 a 20. Un proceso P tiene prioridad 5 y un hijo directo H. ¿Cuáles de estas llamadas de P tienen que funcionar, según las reglas de seguridad del TP?',
      options: opts(
        '`sys_setpriority(0, 3)`',
        '`sys_setpriority(0, 7)`',
        '`sys_setpriority(H, 9)`',
        '`sys_setpriority(<padre de P>, 1)`',
      ),
      answer: ['a', 'c'],
      explanation:
        'Con `envid == 0`, P se refiere a sí mismo: puede **bajarse** la prioridad (a 3) pero no subírsela (a 7). Sobre sus hijos directos puede poner cualquier valor válido, aunque sea mayor que el suyo. Sobre su padre no tiene ningún permiso.',
      difficulty: 2,
      source: AI,
      topics: ['prioridades', 'syscalls'],
    },
    {
      id: 'ai-36',
      kind: 'single',
      prompt: '¿Por qué el rango de prioridades válidas tiene que ser acotado y no negativo?',
      options: opts(
        'Porque `sys_getpriority` devuelve la prioridad y los códigos de error (negativos) por el mismo valor de retorno',
        'Porque x86 no tiene enteros con signo',
        'Porque el timer no funciona con prioridades negativas',
        'Porque `env_priority` es de 8 bits',
      ),
      answer: ['a'],
      explanation:
        'Si una prioridad pudiera ser -3, no habría forma de distinguirla de `-E_INVAL` (`E_INVAL = 3` en `inc/error.h`). Acotarlo además hace falta para la estadística de distribución de CPU por nivel de prioridad. El rango se define y se documenta en el informe.',
      difficulty: 2,
      source: AI,
      topics: ['prioridades', 'syscalls'],
    },
    {
      id: 'ai-37',
      kind: 'single',
      prompt:
        'Un equipo asigna la prioridad por defecto en `env_alloc` y no toca nada más. ¿Qué prioridad recibe el hijo de un `fork`?',
      options: opts(
        'La del padre, porque `fork` copia todo el `struct Env`',
        'La por defecto: `fork` crea al hijo con `sys_exofork`, que llama a `env_alloc`, y nadie copia la del padre',
        'Cero',
        'La del padre más uno',
      ),
      answer: ['b'],
      explanation:
        '`fork` (en `lib/fork.c`) usa `sys_exofork`, que llama a `env_alloc` y copia sólo `env_tf`. Para que el hijo herede la prioridad hay que copiarla en algún lugar de ese camino, por ejemplo en `sys_exofork`, que tiene a mano `curenv`. Dónde y cuánto hereda lo decide el equipo y lo justifica en el informe.',
      difficulty: 3,
      source: AI,
      topics: ['prioridades', 'fork'],
    },
    {
      id: 'ai-38',
      kind: 'single',
      prompt: 'Al correr `user/priotest` con `USE_PR=1`, ¿qué salida corresponde esperar?',
      options: opts(
        'Las líneas de los cuatro hijos intercaladas de forma pareja',
        'Los hijos terminando en orden creciente de prioridad',
        'Los hijos terminando en orden **descendente** de prioridad: el más prioritario acapara la CPU hasta terminar',
        'Sólo el padre imprime, porque los hijos nunca corren',
      ),
      answer: ['c'],
      explanation:
        'Con prioridades, el hijo de mayor prioridad gana casi todas las decisiones mientras esté listo, aunque haga `sys_yield` en cada vuelta (salvo cuando el *aging* empuja a otro, como al padre). Las líneas intercaladas parejas son lo que se ve con `USE_RR=1`: por eso el enunciado pide correr el mismo test con las dos políticas.',
      difficulty: 3,
      source: AI,
      topics: ['prioridades'],
    },
    {
      id: 'ai-39',
      kind: 'single',
      prompt:
        'En `priotest`, el padre se baja la prioridad por debajo de todos sus hijos y después espera a que terminen. ¿Cómo puede volver a correr mientras los hijos siguen listos?',
      options: opts(
        'Porque `sys_yield` le da la CPU al proceso de menor prioridad',
        'Porque los hijos se bloquean en `sys_sleep`',
        'No puede: queda esperando hasta que terminen todos',
        'Por el *aging*: mientras espera, su prioridad efectiva crece hasta que en alguna decisión supera a la de los hijos',
      ),
      answer: ['d'],
      explanation:
        'Lo dice el propio test: "*the only reason it gets the CPU back at all is aging*". Sin *aging*, el padre sólo correría cuando no quedara ningún hijo listo.',
      difficulty: 3,
      source: AI,
      topics: ['aging', 'prioridades'],
    },
    {
      id: 'ai-40',
      kind: 'single',
      prompt:
        'El test propio de *starvation* pide dos procesos CPU-bound con prioridades distintas que **nunca** cedan la CPU por su cuenta. ¿Por qué esa condición?',
      options: opts(
        'Para que lo único que pueda sacarles la CPU sea el timer, y así se vea que el *aging* actúa sobre la *preemption* y no gracias a la cooperación',
        'Porque `sys_yield` no funciona con prioridades',
        'Para que el test termine más rápido',
        'Porque los procesos que ceden la CPU no acumulan `env_wait_ticks`',
      ),
      answer: ['a'],
      explanation:
        'Si los procesos durmieran o se bloquearan, el postergado correría en esos huecos sin necesidad de *aging*, y no se probaría nada. Con dos procesos que nunca ceden, cada decisión la provoca el timer: si el de baja prioridad corre antes de que termine el otro, fue sólo por el *aging*. El mismo test sin *aging* tiene que mostrar la *starvation*.',
      difficulty: 2,
      source: AI,
      topics: ['aging', 'starvation', 'preemption'],
    },

    // Part 4 — user threads
    {
      id: 'ai-41',
      kind: 'single',
      prompt: '¿Cómo se representa un *thread* en el TP?',
      options: opts(
        'Como un `struct Env` con `env_type = ENV_TYPE_THREAD` cuyo `env_pgdir` apunta al mismo page directory que su proceso',
        'Como una estructura de la libc que el kernel no conoce',
        'Como un `struct Env` con una copia del page directory del padre',
        'Como un proceso con prioridad especial',
      ),
      answer: ['a'],
      explanation:
        'El kernel lo trata como a cualquier environment: lo planifica, tiene su propio `env_tf` y su estado. La diferencia es que comparte el espacio de direcciones. Por eso los *threads* funcionan igual con `USE_RR=1` y con `USE_PR=1`.',
      difficulty: 1,
      source: AI,
      topics: ['threads'],
    },
    {
      id: 'ai-42',
      kind: 'multiple',
      prompt: '¿Qué tiene **propio** cada *thread* de un mismo proceso?',
      options: opts(
        'Sus registros (`env_tf`)',
        'Su pila',
        'Su page directory',
        'Su copia de las variables globales',
        'Su `env_id`',
      ),
      answer: ['a', 'b', 'e'],
      explanation:
        'Cada *thread* es un `struct Env` aparte (con su `env_id` y su `env_tf`) y necesita su propia pila, porque ejecuta llamadas a funciones distintas. Lo que comparte es el page directory, y con él toda la memoria: las variables globales son las mismas para todos.',
      difficulty: 2,
      source: AI,
      topics: ['threads'],
    },
    {
      id: 'ai-43',
      kind: 'single',
      prompt: '¿Cuál es la diferencia clave entre `sys_exofork` y `sys_thread_create`?',
      options: opts(
        '`sys_exofork` crea un environment con page directory **propio**; `sys_thread_create` **comparte** el del proceso creador',
        '`sys_exofork` comparte la memoria; `sys_thread_create` la copia',
        '`sys_thread_create` no crea un `struct Env`',
        'Sólo `sys_exofork` puede correr con prioridades',
      ),
      answer: ['a'],
      explanation:
        '`sys_exofork` llama a `env_alloc`, que con `env_setup_vm` arma un page directory nuevo. `sys_thread_create` copia el **puntero** `env_pgdir` del proceso actual, sin duplicar páginas. Por eso un cambio en memoria de un *thread* lo ven todos los demás.',
      difficulty: 1,
      source: AI,
      topics: ['threads', 'memoria'],
    },
    {
      id: 'ai-44',
      kind: 'single',
      prompt: 'Si se llama a `env_free` sobre un *thread* sin modificarla, ¿qué pasa?',
      options: opts(
        'Libera sólo la pila del *thread*',
        'Nada: `env_free` detecta que es un *thread*',
        'Desmapea todo el espacio de usuario y libera el page directory compartido: destruye la memoria del proceso y de los otros *threads*',
        'Destruye al proceso padre pero deja vivos a los otros *threads*',
      ),
      answer: ['c'],
      explanation:
        '`env_free` recorre todo el espacio de usuario de `e->env_pgdir`, hace `page_remove` de cada página y libera el page directory. Sobre un *thread*, ese page directory es el del proceso. Es la advertencia del enunciado antes de tocar `env_free`.',
      difficulty: 2,
      source: AI,
      topics: ['threads', 'memoria'],
    },
    {
      id: 'ai-45',
      kind: 'single',
      prompt: '¿Qué hay que cuidar del `pp_ref` de la página del page directory al compartirlo entre varios environments?',
      options: opts(
        'Nada: el page directory no tiene `pp_ref`',
        'Que valga siempre 1, para que nadie lo libere',
        'Ponerlo en 0 al crear el *thread*',
        'Incrementarlo por cada environment que lo use, para que `page_decref` lo libere sólo cuando se va el último',
      ),
      answer: ['d'],
      explanation:
        '`env_setup_vm` hace `p->pp_ref++` justamente para que `env_free` lo libere con `page_decref`. Si se comparte sin sumar referencias, el primero que termina lo libera y deja a los demás usando una página que se puede reasignar.',
      difficulty: 3,
      source: AI,
      topics: ['threads', 'memoria'],
    },
    {
      id: 'ai-46',
      kind: 'single',
      prompt: '¿Qué hay que respetar al elegir dónde alocar la pila de cada *thread*?',
      options: opts(
        'Que esté arriba de `UTOP`',
        'Que no pise la página `[USTACKTOP - PGSIZE, USTACKTOP)`, que ya usa el *thread* principal, y que las pilas de los *threads* no se solapen entre sí',
        'Que esté en la misma página que el código del *thread*',
        'Que sea la misma pila para todos, porque comparten memoria',
      ),
      answer: ['b'],
      explanation:
        '`load_icode` reserva la página de pila del *thread* principal justo debajo de `USTACKTOP`. Arriba de `UTOP` el usuario no puede alocar. Si dos *threads* compartieran pila, cada llamada a función de uno pisaría las variables locales y las direcciones de retorno del otro. El criterio elegido se documenta en el informe.',
      difficulty: 2,
      source: AI,
      topics: ['threads', 'memoria'],
    },
    {
      id: 'ai-47',
      kind: 'single',
      prompt:
        '`thread_create(func, arg)` tiene que preparar la pila para que `func` reciba `arg` y que al retornar se llame a `exit()`. ¿Cómo queda el tope de la pila al crear el *thread*?',
      options: opts(
        '`func` en el tope y `arg` debajo',
        'Sólo `arg`: `exit` lo llama el kernel',
        'En el tope, la dirección de `exit` (como dirección de retorno); justo encima, `arg` (como primer argumento)',
        'Vacía: `sys_thread_create` se encarga de los argumentos',
      ),
      answer: ['c'],
      explanation:
        'El *thread* arranca en `func` como si lo hubieran llamado con `call`: en `esp` espera la dirección de retorno y en `esp + 4` el primer argumento. Si la dirección de retorno es `exit`, el `ret` de `func` termina el *thread* ordenadamente en vez de saltar a basura.',
      difficulty: 3,
      source: AI,
      topics: ['threads'],
    },
    {
      id: 'ai-48',
      kind: 'single',
      prompt:
        'Dos *threads* hacen `contador++` 1000 veces cada uno sobre una variable global compartida, sin sincronización. ¿Qué puede pasar?',
      options: opts(
        'Siempre termina en 2000',
        'Siempre termina en 1000',
        'El kernel lo detecta y mata a uno de los dos',
        'Puede terminar en menos de 2000: `contador++` es leer, sumar y escribir, y si el timer interrumpe en el medio se pierden incrementos',
      ),
      answer: ['d'],
      explanation:
        'Es una condición de carrera (OSTEP cap. 26). Si un *thread* lee el valor, lo interrumpen, el otro incrementa y escribe, y después el primero escribe su valor viejo más uno, un incremento se pierde. El TP pide mostrar un ejemplo así en el informe, sin necesidad de implementar sincronización.',
      difficulty: 2,
      source: AI,
      topics: ['threads', 'concurrencia'],
    },
    {
      id: 'ai-49',
      kind: 'single',
      prompt:
        'Un *thread* quiere saber su propio `env_id` y usa `thisenv->env_id`. ¿Qué obtiene?',
      options: opts(
        'Su `env_id`, porque `libmain` lo inicializa para cada *thread*',
        'El `env_id` del proceso: `thisenv` es una global compartida y el *thread* arranca en `entry`, sin pasar por `libmain`',
        'Cero',
        'Un *page fault*, porque `thisenv` no está mapeado para los *threads*',
      ),
      answer: ['b'],
      explanation:
        '`libmain` setea `thisenv` una sola vez para el proceso, y todos los *threads* comparten esa variable. Para su propio id, el *thread* puede preguntarle al kernel con `sys_getenvid()`. Los sistemas reales lo resuelven con almacenamiento local por *thread* (*thread-local storage*).',
      difficulty: 3,
      source: AI,
      topics: ['threads'],
    },
    {
      id: 'ai-50',
      kind: 'single',
      prompt: 'En cuanto a páginas de datos del proceso, ¿cuánto copia crear un *thread* comparado con `fork`?',
      options: opts(
        'El *thread* no copia ninguna (sólo aloca su pila); `fork` duplica los mapeos y, en JOS con *copy-on-write*, cada página se copia recién cuando alguien la escribe',
        'Los dos copian todas las páginas',
        'El *thread* copia todas; `fork` ninguna',
        'Ninguno de los dos aloca memoria',
      ),
      answer: ['a'],
      explanation:
        'El *thread* reusa el page directory del proceso: sólo hace falta la página de su pila. `fork` (en `lib/fork.c`) mapea cada página en el hijo con `duppage` marcándola COW, y la copia de verdad se hace después, en el *page fault* de la primera escritura. Por eso crear un *thread* es mucho más barato.',
      difficulty: 2,
      source: AI,
      topics: ['threads', 'fork', 'memoria'],
    },

    // Scheduling theory (OSTEP ch. 7-8, listed in the statement's bibliography)
    {
      id: 'ai-51',
      kind: 'single',
      prompt: 'Comparado con FIFO o SJF, ¿en qué métrica es bueno *round robin* y en cuál es malo?',
      options: opts(
        'Bueno en *turnaround*, malo en tiempo de respuesta',
        'Bueno en tiempo de respuesta, malo en *turnaround*',
        'Bueno en las dos',
        'Malo en las dos',
      ),
      answer: ['b'],
      explanation:
        'Cada proceso corre enseguida durante un *time slice*, así que la respuesta es rápida. Pero al repartir la CPU de a pedazos, todos los trabajos terminan tarde: estira el *turnaround* (OSTEP cap. 7).',
      difficulty: 2,
      source: AI,
      topics: ['teoría de scheduling', 'round robin'],
    },
    {
      id: 'ai-52',
      kind: 'single',
      prompt: '¿Qué problema tiene un *time slice* (quantum) demasiado corto en *round robin*?',
      options: opts(
        'Aumenta la *starvation*',
        'Los procesos largos nunca terminan',
        'El costo de los cambios de contexto pasa a dominar: la CPU pasa más tiempo cambiando de proceso que ejecutándolos',
        'No hay ningún problema: cuanto más corto, mejor',
      ),
      answer: ['c'],
      explanation:
        'Cada cambio de contexto cuesta (guardar y restaurar registros, cambiar `cr3`, cachés y TLB "fríos"). Con un quantum chico se mejora la respuesta, pero ese costo fijo se vuelve una fracción grande del tiempo. El quantum tiene que ser largo como para **amortizarlo** (OSTEP cap. 7).',
      difficulty: 2,
      source: AI,
      topics: ['teoría de scheduling', 'cambio de contexto'],
    },
    {
      id: 'ai-53',
      kind: 'single',
      prompt:
        'En un sistema **cooperativo** (sin interrupción de timer), ¿qué pasa si un proceso entra en un loop infinito sin syscalls?',
      options: opts(
        'El kernel lo detecta y lo mata',
        'El sistema operativo nunca recupera el control: sólo queda reiniciar',
        'El proceso termina solo cuando se le acaba el quantum',
        'Los demás procesos siguen corriendo con normalidad',
      ),
      answer: ['b'],
      explanation:
        'En el enfoque cooperativo el kernel sólo corre cuando el proceso le cede el control (syscall, `yield`) o causa una excepción. Un loop vacío no hace ninguna de esas cosas. Por eso hace falta la interrupción del timer: es lo que el TP prueba con `user/spin` (OSTEP cap. 6).',
      difficulty: 1,
      source: AI,
      topics: ['teoría de scheduling', 'preemption'],
    },
    {
      id: 'ai-54',
      kind: 'single',
      prompt: 'En MLFQ, ¿qué mecanismo cumple el mismo rol que el *aging* del TP?',
      options: opts(
        'Bajar de cola al proceso que usa todo su quantum',
        'El *priority boost*: cada cierto tiempo, subir a todos los trabajos a la cola de mayor prioridad',
        'Darle un quantum más largo a las colas de baja prioridad',
        'Elegir al azar entre los procesos de la misma cola',
      ),
      answer: ['b'],
      explanation:
        'Sin el *boost*, los trabajos largos que cayeron a las colas de abajo podrían no correr nunca si siempre hay interactivos arriba. Subirlos periódicamente garantiza que avancen: es la misma idea que el *aging*, darle CPU a quien lleva mucho esperando (OSTEP cap. 8, regla 5).',
      difficulty: 2,
      source: AI,
      topics: ['teoría de scheduling', 'starvation', 'aging'],
    },
  ],
}
