import type { Option, Quiz, Source } from '../../types'

const REAL: Source = { kind: 'real', exam: 'Parcialito TP3 · 1C2023', answerVerified: true }
const AI: Source = { kind: 'ai' }

const LETTERS = 'abcdefgh'
const opts = (...texts: string[]): Option[] => texts.map((text, i) => ({ id: LETTERS[i], text }))
const TRUE_FALSE = opts('Verdadero', 'Falso')

export const tp3Fs: Quiz = {
  id: 'tp3-fs',
  title: 'Parcialito TP3 — Filesystem',
  description:
    'Toda la teoría del TP3: FUSE y VFS, inodos, dentries y directorios, hard y soft links, VSFS, índice multinivel, resolución de paths, page cache y lo que pide el enunciado de fisopfs.',
  context:
    'Incluye las 10 preguntas reales del parcialito del 1C2023 (mismo TP, respuestas corregidas por la cátedra) y preguntas generadas con IA a partir del enunciado actual, el esqueleto de fisopfs y las clases de File System I y II.',
  questions: [
    // ---------------------------------------------------------------------
    // Real questions — Parcialito TP3, 1C2023 (graded form, answers from staff)
    // ---------------------------------------------------------------------
    {
      id: 'real-01',
      kind: 'single',
      prompt:
        'En un filesystem tipo Unix, ¿qué consecuencia tiene incrementar la cantidad de bloques dedicados a inodos?\n\nConsiderar que lo que se incrementa es la cantidad de bloques de inodos, sin modificar la cantidad de bloques totales del sistema de archivos.',
      options: opts(
        'Al haber más inodos, el límite de archivos por directorio se incrementa de forma proporcional',
        'Permite soportar más archivos, que a su vez pueden ser más grandes en promedio',
        'Permite soportar más archivos, aunque el tamaño promedio de los archivos será menor',
        'Siempre representa una pérdida de espacio en disco: cuanto menos inodos, mejor',
      ),
      answer: ['c'],
      explanation:
        'Cada archivo necesita un inodo, así que más inodos permiten más archivos. Pero el total de bloques es fijo: los bloques que se pasan a la tabla de inodos salen de la región de datos, y ese espacio de datos se reparte entre más archivos. Los archivos por directorio no dependen de los inodos (dependen del tamaño de los directorios), y "cuanto menos inodos, mejor" ignora que sin inodos no se pueden crear archivos.',
      difficulty: 2,
      source: REAL,
      topics: ['inodos', 'VSFS'],
    },
    {
      id: 'real-02',
      kind: 'single',
      prompt:
        'En un filesystem tipo Unix, el tamaño de los bloques viene dado exclusivamente por el hardware donde se almacenarán los datos.',
      options: TRUE_FALSE,
      answer: ['b'],
      explanation:
        'El tamaño de bloque es una decisión del *filesystem*: el disco lee y escribe sectores, y el FS agrupa varios sectores en un bloque (en Linux, típicamente 4 KB, el tamaño de una página). Dos FS sobre el mismo disco pueden usar bloques distintos.',
      difficulty: 1,
      source: REAL,
      topics: ['bloques'],
    },
    {
      id: 'real-03',
      kind: 'single',
      prompt:
        'El mecanismo de interacción entre el Kernel y FUSE es:\n\nNota: el proceso que implementa el filesystem en FUSE se conoce también como *daemon* de FUSE',
      options: opts(
        'El kernel siempre recibe todas las peticiones de syscalls, y las reenvía al daemon de FUSE para que las maneje acordemente',
        'El daemon de FUSE recibe directamente las peticiones del usuario del filesystem y las maneja acordemente sin necesidad del kernel',
        'El daemon de FUSE intercepta las peticiones y se las reenvía al kernel para que éste las maneje',
        'Ninguna de las anteriores',
      ),
      answer: ['a'],
      explanation:
        'Un `read` sobre un archivo de un montaje FUSE es una syscall común: entra al kernel, el VFS ve que el *path* es de un FS de tipo FUSE y el módulo FUSE le pasa la operación al proceso de usuario (el *daemon*), que responde. No hay forma de saltearse el kernel, y el *daemon* no intercepta nada: es el kernel el que le delega.',
      difficulty: 1,
      source: REAL,
      topics: ['FUSE'],
    },
    {
      id: 'real-04',
      kind: 'multiple',
      prompt: 'Los inodos en un filesystem tipo Unix',
      options: opts(
        'Contienen el nombre del archivo/directorio',
        'Contienen referencia a los bloques de datos del archivo/directorio',
        'Contienen metadata del archivo/directorio',
        'Mantienen una relación 1:1 entre archivo/directorio e i-nodo',
      ),
      answer: ['b', 'c', 'd'],
      explanation:
        'El inodo guarda la metadata (tipo, permisos, dueño, tamaño, fechas, cantidad de *links*) y los punteros a los bloques de datos. Cada archivo tiene exactamente un inodo. Lo que **no** guarda es el nombre: el nombre está en el *dentry*, dentro del directorio, y por eso un mismo inodo puede tener varios nombres (*hard links*).',
      difficulty: 1,
      source: REAL,
      topics: ['inodos'],
    },
    {
      id: 'real-05',
      kind: 'multiple',
      prompt: 'Al usar un filesystem de tipo FUSE',
      options: opts(
        'El kernel no interviene nunca, dado que el filesystem se implementa exclusivamente en modo usuario',
        'Es necesario implementar la totalidad de las operaciones',
        'Aunque se corra en modo usuario, seguimos necesitando un disco físico donde persistir los datos',
        'El programa de usuario del filesystem debe compilarse con librerías especiales',
      ),
      answer: ['d'],
      explanation:
        'El *daemon* se linkea con **libfuse** (en el TP, la v2, con los flags que da `pkg-config fuse`). El kernel interviene siempre: recibe la syscall y se la pasa al *daemon*. No hace falta implementar todas las operaciones: las que faltan devuelven `ENOSYS` (*Function not implemented*). Y no hace falta un disco: el FS puede vivir sólo en memoria o ir a la red.',
      difficulty: 2,
      source: REAL,
      topics: ['FUSE'],
    },
    {
      id: 'real-06',
      kind: 'multiple',
      prompt: 'Los bloques indirectos en un inodo: ¿Qué beneficio/s traen?',
      options: opts(
        'Hacen que los accesos a disco sean más rápidos',
        'Cada nivel de indirección hace crecer el tamaño final del archivo exponencialmente',
        'Mantiene el tamaño del inodo constante, sin importar el tamaño de los archivos',
        'Las referencias hacen al filesystem independiente de la arquitectura',
      ),
      answer: ['b', 'c'],
      explanation:
        'El inodo guarda siempre los mismos punteros (en FFS, 12 directos y 3 indirectos); los punteros extra viven en bloques de datos aparte, así que el inodo no crece. Con P punteros por bloque, cada nivel suma P, P² y P³ bloques: el máximo crece exponencialmente. No aceleran nada (cada nivel agrega una lectura más) ni tienen que ver con la arquitectura.',
      difficulty: 2,
      source: REAL,
      topics: ['índice multinivel'],
    },
    {
      id: 'real-07',
      kind: 'multiple',
      prompt: 'Sobre Linux Virtual File System (VFS):',
      options: opts(
        'Provee una interfaz genérica para todo tipo de filesystem',
        'Define los parámetros de cuántos inodos y bloques de datos puede tener un filesystem tipo Unix',
        'Sólo soporta filesystems en discos físicos',
        'Se maneja en modo usuario',
      ),
      answer: ['a'],
      explanation:
        'VFS es la capa del kernel que define el modelo común (superbloque, inodo, *dentry*, *file* y sus operaciones) que implementa cada FS, para que `open`, `read` o `write` funcionen igual sobre ext4, FAT o `/proc`. No fija cuántos inodos o bloques tiene un FS (eso lo decide cada FS), soporta FS sin disco (`/proc`, FUSE) y corre en el kernel.',
      difficulty: 1,
      source: REAL,
      topics: ['VFS'],
    },
    {
      id: 'real-08',
      kind: 'single',
      prompt: '¿Dónde se encuentra, en un filesystem de tipo Unix, la referencia al inodo raíz?',
      options: opts(
        'Está definido por el hardware, dependiendo entonces del modelo de disco',
        'Lo define el sistema de archivos, dentro del superbloque',
        'Lo define el sistema de archivos, está siempre dentro del primer bloque de datos',
        'Ninguna de las anteriores',
      ),
      answer: ['b'],
      explanation:
        'El superbloque tiene la información del FS entero: cuántos inodos y bloques hay, dónde empiezan los bitmaps y la tabla de inodos, y cuál es el inodo raíz. Es lo que el kernel necesita para montar el FS y desde donde arranca a resolver cualquier *path* absoluto.',
      difficulty: 1,
      source: REAL,
      topics: ['superbloque'],
    },
    {
      id: 'real-09',
      kind: 'single',
      prompt: 'En un filesystem de tipo Unix, los directorios...',
      options: opts(
        'Solo pueden tener un único bloque de datos',
        'Sus datos son un arreglo de entradas de directorio, compuestas por nombre de archivo y número de inodo',
        'Sus datos son un arreglo de entradas de directorio, compuestas por nombre de archivo, metadata del archivo y número de inodo',
        'Sus datos son un arreglo de números de inodo',
      ),
      answer: ['b'],
      explanation:
        'Un directorio es un inodo de tipo directorio cuyos bloques contienen *dentries*: pares (nombre, número de inodo), más `.` y `..`. La metadata no está en el directorio sino en el inodo de cada archivo; sin los nombres no habría cómo resolver un *path*; y un directorio grande puede ocupar varios bloques.',
      difficulty: 1,
      source: REAL,
      topics: ['directorios', 'dentries'],
    },
    {
      id: 'real-10',
      kind: 'single',
      prompt:
        'La cache de bloque de disco tiene como finalidad la de reducir la cantidad de operaciones de I/O para la lectura de archivos',
      options: TRUE_FALSE,
      answer: ['a'],
      explanation:
        'Guarda en RAM los bloques ya leídos (en Linux, el *page cache*, que reemplazó al *buffer cache*): si un bloque se vuelve a pedir, se sirve de memoria sin ir al disco. El buffer cache además sincroniza el acceso, con una sola copia de cada bloque en memoria.',
      difficulty: 1,
      source: REAL,
      topics: ['page cache'],
    },

    // ---------------------------------------------------------------------
    // AI-generated questions — FUSE and the fisopfs assignment
    // ---------------------------------------------------------------------
    {
      id: 'ai-01',
      kind: 'single',
      prompt: '¿Qué estructura le pasa el programa a `fuse_main` para indicar qué hacer con cada operación?',
      options: opts(
        'Un `struct stat` por cada archivo del *filesystem*',
        'Un `struct fuse_operations` con punteros a función',
        'El archivo de persistencia `.fisopfs` ya abierto',
        'Una tabla de *dentries* con los archivos iniciales',
      ),
      answer: ['b'],
      explanation:
        '`struct fuse_operations` es una tabla de punteros a función (`getattr`, `readdir`, `read`, `create`…). libfuse recibe el pedido del kernel y llama a la función correspondiente. Es el mismo truco que usa VFS para tener polimorfismo en C.',
      difficulty: 1,
      source: AI,
      topics: ['FUSE'],
    },
    {
      id: 'ai-02',
      kind: 'single',
      prompt: '¿Qué versión de libfuse usa el TP?',
      options: opts(
        'La v3, porque es la que documenta el sitio de libfuse',
        'La v2 (2.9.9)',
        'Cualquiera: las firmas de las operaciones son las mismas',
        'Ninguna: FUSE viene incluido en la libc',
      ),
      answer: ['b'],
      explanation:
        'El esqueleto define `FUSE_USE_VERSION 30` pero compila contra libfuse 2 (el Docker trae `libfuse2`), y las diapos indican la v2. La doc web es de la v3 y varias firmas cambian: por ejemplo, `getattr` en v3 recibe un parámetro más. Un ejemplo de internet con otras firmas probablemente sea de la v3.',
      difficulty: 1,
      source: AI,
      topics: ['FUSE'],
    },
    {
      id: 'ai-03',
      kind: 'single',
      prompt: 'Un grupo implementa `read` para `/notas.txt` pero `cat notas.txt` igual dice *No such file or directory*. ¿Qué es lo más probable?',
      options: opts(
        'Falta implementar `open`',
        'El `read` devuelve los bytes en orden inverso',
        '`getattr` no encuentra `/notas.txt`',
        'El kernel cachea los archivos y nunca llama a `read`',
      ),
      answer: ['c'],
      explanation:
        'FUSE llama a `getattr` antes (y después) de casi cualquier operación. Si `getattr` devuelve `-ENOENT`, para el kernel el archivo no existe y `read` nunca llega. Lo remarcó el profe en la presentación: `getattr` tiene que crecer junto con todo lo demás.',
      difficulty: 2,
      source: AI,
      topics: ['FUSE', 'getattr'],
    },
    {
      id: 'ai-04',
      kind: 'single',
      prompt: '¿Hay una correspondencia 1 a 1 entre las syscalls que hace un proceso y las operaciones de FUSE que recibe el *filesystem*?',
      options: opts(
        'Sí: cada syscall genera exactamente la operación de FUSE con el mismo nombre',
        'No: una syscall puede generar varias operaciones, y no siempre con el mismo nombre',
        'Sí, salvo `stat`, que no llega a FUSE',
        'No: las syscalls de lectura no llegan nunca al *filesystem*',
      ),
      answer: ['b'],
      explanation:
        'Un `cat` genera `getattr` y `read`; un `touch` de un archivo nuevo, varios `getattr` y una creación. Por eso el enunciado recomienda registrar operaciones vacías con un `printf` y montar con `-f` para ver qué llega con cada comando.',
      difficulty: 1,
      source: AI,
      topics: ['FUSE'],
    },
    {
      id: 'ai-05',
      kind: 'single',
      prompt: '¿Qué devuelve una operación de FUSE para informar que el *path* no existe?',
      options: opts('`ENOENT`', '`-1`, dejando el error en `errno`', '`-ENOENT`', '`NULL`'),
      answer: ['c'],
      explanation:
        'Las operaciones de FUSE devuelven 0 (o una cantidad de bytes) si salió bien y el **negativo** del código de error si falló: `return -ENOENT;`, como en el `getattr` del esqueleto. libfuse se lo pasa al kernel, que se lo devuelve a la syscall del proceso, que lo ve como `-1` con `errno = ENOENT`.',
      difficulty: 1,
      source: AI,
      topics: ['FUSE', 'errores'],
    },
    {
      id: 'ai-06',
      kind: 'single',
      prompt: 'Con el esqueleto sin modificar, `touch prueba/nuevo` falla. ¿Qué error ve el usuario?',
      options: opts(
        '*Permission denied* (`EACCES`)',
        '*No space left on device* (`ENOSPC`)',
        '*Read-only file system* (`EROFS`)',
        '*Function not implemented* (`ENOSYS`)',
      ),
      answer: ['d'],
      explanation:
        'La operación que FUSE intenta para crear el archivo no está en la tabla `fuse_operations` del esqueleto, y libfuse responde `ENOSYS`. Es la señal de que hay que implementar esa operación.',
      difficulty: 1,
      source: AI,
      topics: ['FUSE', 'errores'],
    },
    {
      id: 'ai-07',
      kind: 'single',
      prompt: '¿Para qué sirve lanzar el *filesystem* con `-f` (`./fisopfs -f prueba/`)?',
      options: opts(
        'Para que corra en primer plano y se vean sus `printf` en esa terminal',
        'Para forzar que se guarde el archivo de persistencia en cada operación',
        'Para formatear el *filesystem* y empezar vacío',
        'Para montarlo con permisos de root',
      ),
      answer: ['a'],
      explanation:
        'Sin `-f` el proceso pasa a *background* y su salida estándar no se ve. Con `-f` toma la terminal y muestra los `[debug]`; para usar el FS hay que abrir otra terminal (con Docker, `make exec` entra al mismo contenedor).',
      difficulty: 1,
      source: AI,
      topics: ['FUSE', 'entorno'],
    },
    {
      id: 'ai-08',
      kind: 'single',
      prompt: '¿Cómo se termina correctamente el proceso del *filesystem* montado en `prueba/`?',
      options: opts(
        'Con `kill -9` del proceso `fisopfs`',
        'Borrando el directorio `prueba/`',
        'Con `umount prueba`',
        'Cerrando la terminal donde se lanzó',
      ),
      answer: ['c'],
      explanation:
        '`umount` desmonta y el proceso termina solo, pasando por `destroy`: ahí es donde se guarda el *filesystem* a disco. Matar el proceso a la fuerza deja el punto de montaje colgado (*Transport endpoint is not connected*) y no persiste nada.',
      difficulty: 1,
      source: AI,
      topics: ['FUSE', 'persistencia'],
    },
    {
      id: 'ai-09',
      kind: 'multiple',
      prompt: 'Según el enunciado, ¿en qué momentos se lee o se escribe el archivo de persistencia `.fisopfs`?',
      options: opts(
        'Se lee entero al montar, en `init`',
        'Se escribe al desmontar, en `destroy`',
        'Se escribe cuando llega un `flush`',
        'Se lee de nuevo en cada `read`, para tener los datos actualizados',
      ),
      answer: ['a', 'b', 'c'],
      explanation:
        'Al montar se carga todo a memoria y de ahí en más se trabaja sólo en RAM. Se persiste al desmontar y en un `flush`. Leer el disco en cada operación contradice la idea del TP: un FS en memoria que apunta a la velocidad.',
      difficulty: 1,
      source: AI,
      topics: ['persistencia'],
    },
    {
      id: 'ai-10',
      kind: 'single',
      prompt: 'Según el comentario de `fuse.h` 2.9.9, ¿cuándo se llama a la operación `flush`?',
      options: opts(
        'Sólo cuando el proceso hace `fsync`',
        'Una vez al desmontar, antes de `destroy`',
        'Cada vez que el *page cache* se llena',
        'En cada `close()` de un *file descriptor*, y puede llegar más de una vez por cada `open()`',
      ),
      answer: ['d'],
      explanation:
        '`flush` no equivale a `fsync`: llega con cada `close`, y si el descriptor se duplicó (con `dup` o `fork`) llega una vez por cada copia que se cierra. Si el FS guarda todo a disco en `flush`, un `echo hola > a` ya dispara una escritura del archivo de persistencia.',
      difficulty: 3,
      source: AI,
      topics: ['FUSE', 'persistencia'],
    },
    {
      id: 'ai-11',
      kind: 'single',
      prompt: '¿Por qué el esqueleto pide armar un *path* **absoluto** para el archivo de persistencia antes de llamar a `fuse_main`?',
      options: opts(
        'Porque al pasar a *background* el directorio de trabajo del proceso puede cambiar, y un *path* relativo dejaría de apuntar al archivo correcto',
        'Porque `fopen` no acepta *paths* relativos',
        'Porque el archivo de persistencia tiene que estar dentro del punto de montaje',
        'Porque `--filedisk` sólo acepta nombres sin directorio',
      ),
      answer: ['a'],
      explanation:
        'El comentario del esqueleto es "*handle absolute path for persistence file so background executions can work properly*" y sugiere usar `getcwd(3)` **antes** de `fuse_main`. Un *path* relativo se resuelve contra el directorio de trabajo actual, y en *background* ese ya no es el directorio desde donde se lanzó. El archivo no puede estar dentro del punto de montaje: estaría dentro del propio FS.',
      difficulty: 2,
      source: AI,
      topics: ['persistencia', 'FUSE'],
    },
    {
      id: 'ai-12',
      kind: 'single',
      prompt: 'Si se lanza `./fisopfs prueba/` sin `--filedisk`, ¿qué archivo de persistencia se usa?',
      options: opts(
        'Ninguno: sin `--filedisk` no hay persistencia',
        '`prueba.fisopfs`',
        '`persistence_file.fisopfs`',
        '`fs.fisopfs`, dentro de `prueba/`',
      ),
      answer: ['c'],
      explanation:
        'El valor por defecto del esqueleto es `persistence_file.fisopfs`. La sección de `main` que parsea `--filedisk` no se puede modificar.',
      difficulty: 1,
      source: AI,
      topics: ['persistencia'],
    },
    {
      id: 'ai-13',
      kind: 'single',
      prompt: '¿Qué tiene que hacer `readdir` además de devolver los archivos que contiene el directorio?',
      options: opts(
        'Devolver también las entradas `.` y `..`',
        'Devolver también los archivos de los subdirectorios',
        'Ordenar las entradas alfabéticamente',
        'Devolver el tamaño total del directorio',
      ),
      answer: ['a'],
      explanation:
        'El enunciado pide que `ls` muestre los pseudo-directorios `.` y `..`. En FUSE se cargan con la misma función `filler` que el resto de las entradas. Un `readdir` lista sólo los hijos directos; el orden lo resuelve `ls`.',
      difficulty: 1,
      source: AI,
      topics: ['directorios', 'FUSE'],
    },
    {
      id: 'ai-14',
      kind: 'single',
      prompt: 'El enunciado recomienda separar la lógica del *filesystem* en `fs.c`. ¿Qué **no** deberían recibir esas funciones?',
      options: opts(
        'Un *path*',
        'Un puntero a la estructura del *filesystem*',
        'Tipos de FUSE, como `fuse_fill_dir_t` o `struct fuse_file_info`',
        'Un *buffer* de bytes',
      ),
      answer: ['c'],
      explanation:
        'La idea es que la lógica del FS no dependa de FUSE: `fs.c` devuelve, por ejemplo, la lista de entradas, y `fisopfs.c` llama a `filler` por cada una. En la presentación el profe lo llamó "el requerimiento".',
      difficulty: 1,
      source: AI,
      topics: ['modularización'],
    },
    {
      id: 'ai-15',
      kind: 'single',
      prompt: 'Un grupo guarda el contenido de los archivos con `strcpy` y calcula el tamaño con `strlen`. ¿Qué requisito del enunciado rompe?',
      options: opts(
        'Las fechas de acceso y modificación',
        'El soporte de contenido **binario**',
        'Los dos niveles de directorios',
        'La ejecución en *background*',
      ),
      answer: ['b'],
      explanation:
        'Un archivo binario puede tener bytes `\\0` en el medio: `strcpy` corta en el primero y `strlen` da un tamaño menor al real. Con contenido binario hay que copiar con `memcpy` y llevar el tamaño en un campo propio.',
      difficulty: 3,
      source: AI,
      topics: ['contenido binario'],
    },
    {
      id: 'ai-16',
      kind: 'single',
      prompt: '¿Qué error recomienda devolver el enunciado (Ayuda 2) cuando se supera el tamaño máximo del *filesystem*?',
      options: opts('`ENOSPC`', '`ENOMEM`', '`EIO`', '`EINVAL`'),
      answer: ['a'],
      explanation:
        '`ENOSPC` es *No space left on device*. El enunciado recomienda arreglos de tamaño estático y definir un tamaño máximo. Para un archivo que pasa su propio máximo encaja mejor `EFBIG` (*File too large*).',
      difficulty: 1,
      source: AI,
      topics: ['errores', 'límites'],
    },
    {
      id: 'ai-17',
      kind: 'single',
      prompt: '`rmdir dir_1` sobre un directorio que todavía tiene `file_2` adentro. ¿Qué tiene que pasar?',
      options: opts(
        'Se borra `dir_1` junto con `file_2`',
        'Se borra `dir_1` y `file_2` pasa a la raíz',
        'Falla con *Directory not empty* (`ENOTEMPTY`) y no se borra nada',
        'Falla con *No such file or directory* (`ENOENT`)',
      ),
      answer: ['c'],
      explanation:
        'El enunciado pide que `rmdir` sólo borre directorios **vacíos** (salvo `.` y `..`). Si tiene entradas, devuelve el error y deja todo como estaba. Borrar recursivamente es lo que hace `rm -r`, entrada por entrada.',
      difficulty: 1,
      source: AI,
      topics: ['directorios', 'errores'],
    },
    {
      id: 'ai-18',
      kind: 'single',
      prompt:
        'En un *filesystem* como ext4, se crea `/d` (vacío) y después `/d/a` y `/d/b`, ambos directorios. ¿Qué muestra `stat /d` en el campo *Links*?',
      options: opts('1', '2', '3', '4'),
      answer: ['d'],
      explanation:
        'Al directorio `/d` lo nombran: su *dentry* en `/`, su propia entrada `.` y la entrada `..` de cada subdirectorio. Vacío tiene 2; cada subdirectorio suma 1: 2 + 2 = 4. Los archivos regulares no suman, porque no tienen `..`. Es la convención de ext4 y tmpfs (no figura en las diapos; otros FS, como btrfs, muestran otro valor), y la forma de ver en el disco real qué significa el contador que el enunciado pide mantener al crear y borrar directorios.',
      difficulty: 3,
      source: AI,
      topics: ['directorios', 'links'],
    },
    {
      id: 'ai-19',
      kind: 'single',
      prompt: '¿Qué usuario y grupo deben tener los archivos que se crean en `fisopfs`?',
      options: opts(
        'Siempre root (0:0)',
        'El usuario y el grupo actuales, con `getuid(2)` y `getgid(2)`',
        'Los del archivo de persistencia',
        'Los del directorio padre',
      ),
      answer: ['b'],
      explanation:
        'El enunciado pide asumir que todos los archivos los crea el usuario y grupo actuales. El esqueleto, en cambio, fija sólo `st_uid` con valores de ejemplo (1717 y 1818) y no setea `st_gid`: hay que reemplazarlos por `getuid()` y `getgid()`.',
      difficulty: 1,
      source: AI,
      topics: ['stat'],
    },
    {
      id: 'ai-20',
      kind: 'multiple',
      prompt: '¿Qué pide el enunciado sobre las pruebas del TP?',
      options: opts(
        'Pruebas de caja negra: comandos que arman un escenario y la salida esperada',
        'Al menos una prueba por funcionalidad',
        'Que se puedan correr todas con un comando provisto por el grupo',
        'Que estén escritas en C con un *framework* de la cátedra',
      ),
      answer: ['a', 'b', 'c'],
      explanation:
        'La cátedra no da pruebas: las diseña el grupo, y las salidas van al informe. El lenguaje es libre (bash, Python, C…); en clase el profe dijo que alcanza con un script que vaya mostrando "pasó tal prueba". Las unitarias sobre funciones internas son opcionales.',
      difficulty: 1,
      source: AI,
      topics: ['pruebas'],
    },
    {
      id: 'ai-21',
      kind: 'single',
      prompt: '¿Qué es un *mount point*?',
      options: opts(
        'El archivo `.fisopfs` donde se guarda el *filesystem*',
        'El directorio a partir del cual se accede a un *filesystem* montado',
        'El inodo raíz guardado en el superbloque',
        'El proceso de usuario que implementa el FS',
      ),
      answer: ['b'],
      explanation:
        'Al montar, un directorio del árbol pasa a mostrar la raíz del otro FS: todo lo que cuelga de ahí lo resuelve ese FS. Conviene que esté vacío, porque mientras dura el montaje su contenido original queda tapado.',
      difficulty: 1,
      source: AI,
      topics: ['mount'],
    },
    {
      id: 'ai-22',
      kind: 'single',
      prompt: '`echo hola > a` y después `echo chau >> a`. ¿Qué tiene `a`?',
      options: opts('`chau`', '`hola` y debajo `chau`', '`hola`', '`chauhola`'),
      answer: ['b'],
      explanation:
        '`>` abre truncando (el contenido anterior se descarta) y `>>` abre en modo *append*: cada escritura va al final. Son las dos formas de escritura que el enunciado pide soportar (*trunc* y *append*).',
      difficulty: 1,
      source: AI,
      topics: ['escritura'],
    },

    // ---------------------------------------------------------------------
    // AI-generated questions — inodes, dentries, directories, VFS
    // ---------------------------------------------------------------------
    {
      id: 'ai-23',
      kind: 'single',
      prompt: '¿Qué es un *dentry*?',
      options: opts(
        'La relación entre un nombre y un número de inodo',
        'El bloque donde están los datos de un directorio',
        'Un inodo de tipo directorio',
        'La entrada de la tabla de archivos abiertos',
      ),
      answer: ['a'],
      explanation:
        'El *dentry* (*directory entry*) une un nombre con un inodo, y los directorios son listas de *dentries*. Puede haber varios apuntando al mismo inodo: eso es un *hard link*. La entrada de la tabla de archivos abiertos es el objeto *file* del VFS.',
      difficulty: 1,
      source: AI,
      topics: ['dentries'],
    },
    {
      id: 'ai-24',
      kind: 'single',
      prompt: '¿Cuál de estos tipos de inodo **no** existe en el campo `mode`?',
      options: opts('Link simbólico (`S_IFLNK`)', 'FIFO (`S_IFIFO`)', 'Directorio (`S_IFDIR`)', '*Hard link*'),
      answer: ['d'],
      explanation:
        'Un *hard link* no es un inodo: es otro *dentry* apuntando al mismo inodo, así que no tiene tipo propio. El *symlink* sí es un inodo, de tipo `S_IFLNK`, cuyo contenido es un *path*.',
      difficulty: 2,
      source: AI,
      topics: ['inodos', 'links'],
    },
    {
      id: 'ai-25',
      kind: 'single',
      prompt: '¿Por qué el nombre de un archivo no puede guardarse en su inodo?',
      options: opts(
        'Porque el inodo tiene un tamaño fijo de 128 bytes',
        'Porque un mismo inodo puede tener varios nombres, en directorios distintos',
        'Porque los nombres se guardan en el superbloque',
        'Porque el nombre cambia cada vez que se abre el archivo',
      ),
      answer: ['b'],
      explanation:
        'Con *hard links*, un inodo puede tener varios nombres a la vez y ninguno es "el original". Si el nombre estuviera en el inodo, sólo podría tener uno. Por eso el nombre vive en el *dentry*, dentro del directorio.',
      difficulty: 2,
      source: AI,
      topics: ['inodos', 'dentries'],
    },
    {
      id: 'ai-26',
      kind: 'multiple',
      prompt: '¿Cuáles son los cuatro objetos que define VFS?',
      options: opts('Superbloque', 'Inodo', '*Dentry*', '*File*', 'Bitmap'),
      answer: ['a', 'b', 'c', 'd'],
      explanation:
        'Superbloque (un FS montado), inodo (un archivo), *dentry* (un componente de un *path*) y *file* (un archivo abierto por un proceso), cada uno con su tabla de operaciones. El bitmap es una estructura en disco de algunos FS (como VSFS), no un objeto de VFS.',
      difficulty: 2,
      source: AI,
      topics: ['VFS'],
    },
    {
      id: 'ai-27',
      kind: 'single',
      prompt: '¿Qué objeto del VFS corresponde a una entrada de la tabla de archivos abiertos del kernel?',
      options: opts('El inodo', 'El *dentry*', 'El *file*', 'El superbloque'),
      answer: ['c'],
      explanation:
        'El objeto *file* representa un archivo abierto por un proceso (con su *offset* y su modo de apertura). La cadena es proceso → *file* → *dentry* → inodo. Dos `open` del mismo archivo dan dos *file* distintos sobre el mismo inodo.',
      difficulty: 2,
      source: AI,
      topics: ['VFS'],
    },
    {
      id: 'ai-28',
      kind: 'single',
      prompt: '¿Cómo logra VFS tener "polimorfismo" en C, que no es orientado a objetos?',
      options: opts(
        'Con *structs* de punteros a función que cada FS completa con sus implementaciones',
        'Con macros que se expanden distinto para cada FS',
        'Compilando un kernel distinto por cada FS',
        'Con un `switch` sobre el tipo de FS en cada syscall',
      ),
      answer: ['a'],
      explanation:
        'Cada objeto tiene su tabla de operaciones (`super_operations`, `inode_operations`, `dentry_operations`, `file_operations`) y cada FS conecta ahí sus funciones. FUSE usa la misma idea del lado de usuario con `struct fuse_operations`.',
      difficulty: 2,
      source: AI,
      topics: ['VFS'],
    },
    {
      id: 'ai-29',
      kind: 'single',
      prompt: '`/proc` no tiene ningún disco detrás. ¿Cómo puede montarse en el mismo árbol que ext4?',
      options: opts(
        'Porque se guarda en un archivo oculto del disco principal',
        'No puede: `/proc` es un programa de usuario, no un FS',
        'Porque es un FUSE que corre como root',
        'Porque implementa la interfaz de VFS, que no exige un disco',
      ),
      answer: ['d'],
      explanation:
        'VFS sólo pide que el FS implemente sus objetos y operaciones; de dónde salen los datos es asunto de cada FS. `/proc` arma sus inodos en memoria. Lo mismo vale para un FUSE en RAM como `fisopfs`.',
      difficulty: 2,
      source: AI,
      topics: ['VFS'],
    },

    // ---------------------------------------------------------------------
    // AI-generated questions — hard links and soft links
    // ---------------------------------------------------------------------
    {
      id: 'ai-30',
      kind: 'single',
      prompt: '`ln a b` (sin `-s`), después `rm a`. ¿Qué pasa con `cat b`?',
      options: opts(
        'Muestra el contenido original: el inodo sigue vivo',
        'Falla: `b` apuntaba a `a`, que ya no existe',
        'Muestra un archivo vacío',
        'Falla porque `rm` no se permite si hay *hard links*',
      ),
      answer: ['a'],
      explanation:
        '`a` y `b` son dos nombres del mismo inodo, sin uno original. `rm a` borra un nombre y baja el contador de *links* de 2 a 1; el inodo y sus datos siguen mientras quede algún nombre.',
      difficulty: 1,
      source: AI,
      topics: ['links'],
    },
    {
      id: 'ai-31',
      kind: 'single',
      prompt: '`ln -s a b`, después `rm a`. ¿Qué pasa con `cat b`?',
      options: opts(
        'Muestra el contenido original: el *symlink* guarda el número de inodo',
        'Falla: `b` guarda el *path* `a`, que ya no existe',
        'Muestra un archivo vacío',
        '`rm a` falla porque `a` tiene un *symlink*',
      ),
      answer: ['b'],
      explanation:
        'El *symlink* es un archivo propio cuyo contenido es un *path*. Al usarlo se resuelve ese *path* de nuevo; si el destino se borró, el link queda roto (*No such file or directory*).',
      difficulty: 1,
      source: AI,
      topics: ['links'],
    },
    {
      id: 'ai-32',
      kind: 'single',
      prompt: '¿Por qué no se puede crear un *hard link* a un archivo que está en otra partición?',
      options: opts(
        'Porque el *dentry* guarda un número de inodo, que sólo vale dentro de su propio FS',
        'Porque las particiones tienen distinto tamaño de bloque',
        'Porque el kernel no permite abrir dos particiones a la vez',
        'Sí se puede, si las dos particiones son ext4',
      ),
      answer: ['a'],
      explanation:
        'Cada FS numera sus inodos por su cuenta: el inodo 61 de un disco no tiene relación con el 61 de otro. Un *symlink* sí funciona entre particiones, porque guarda un *path*, que es válido en todo el árbol.',
      difficulty: 2,
      source: AI,
      topics: ['links'],
    },
    {
      id: 'ai-33',
      kind: 'single',
      prompt: '¿Cuándo libera realmente el *filesystem* el inodo y los datos de un archivo?',
      options: opts(
        'Apenas se hace `rm` de cualquiera de sus nombres',
        'Cuando el contador de *links* llega a 0 y nadie lo tiene abierto',
        'Cuando se desmonta el *filesystem*',
        'Cuando se borra el último *symlink* que apunta a él',
      ),
      answer: ['b'],
      explanation:
        '`unlink` borra un nombre y baja el contador. Recién cuando no queda ningún nombre ni ningún proceso con el archivo abierto se libera el inodo. Los *symlinks* no cuentan: no suben el contador del destino. La parte del archivo abierto viene del `man` de `unlink`; el *challenge* de *hard links* pide la otra mitad: borrar de verdad sólo cuando no queda ningún *hard link*.',
      difficulty: 2,
      source: AI,
      topics: ['links', 'unlink'],
    },
    {
      id: 'ai-34',
      kind: 'single',
      prompt: '¿Cuál es la razón habitual para no permitir *hard links* a directorios?',
      options: opts(
        'Que los directorios no tienen contador de *links*',
        'Que podrían formarse ciclos en el árbol y `..` dejaría de estar bien definido',
        'Que los directorios no tienen inodo',
        'Que ocuparían demasiado espacio',
      ),
      answer: ['b'],
      explanation:
        'Un directorio que se contiene a sí mismo haría entrar en bucle a `find`, `du` o `fsck`, y `..` tendría más de un padre posible. Los *symlinks* a directorios sí se permiten: los programas que recorren el árbol pueden detectarlos y no seguirlos.',
      difficulty: 2,
      source: AI,
      topics: ['links', 'directorios'],
    },

    // ---------------------------------------------------------------------
    // AI-generated questions — VSFS and multilevel index
    // ---------------------------------------------------------------------
    {
      id: 'ai-35',
      kind: 'single',
      prompt: '¿En qué orden aparecen las regiones de un VSFS en el disco?',
      options: opts(
        'Superbloque, tabla de inodos, bitmap de inodos, bitmap de datos, datos',
        'Superbloque, bitmap de inodos, bitmap de datos, tabla de inodos, datos',
        'Bitmap de inodos, superbloque, tabla de inodos, datos, bitmap de datos',
        'Tabla de inodos, superbloque, datos, bitmaps',
      ),
      answer: ['b'],
      explanation:
        'El orden de VSFS (cap. 40 de OSTEP) es superbloque, bitmap de inodos, bitmap de datos, tabla de inodos y región de datos. En clase el profe aclaró que olvidarse del superbloque en un ejercicio de dimensionado está mal.',
      difficulty: 1,
      source: AI,
      topics: ['VSFS'],
    },
    {
      id: 'ai-36',
      kind: 'single',
      prompt:
        'Un VSFS de 1024 bloques de 4 KB con inodos de 256 B, con el criterio de la cátedra (en un disco de N bloques entran N archivos). ¿Cuántos bloques ocupa la tabla de inodos?',
      options: opts('16', '64', '256', '1'),
      answer: ['b'],
      explanation:
        'Hacen falta 1024 inodos. En un bloque de 4096 B entran 4096 / 256 = 16 inodos, así que la tabla ocupa 1024 / 16 = 64 bloques. Con 1 superbloque y 1 bloque por bitmap, quedan 1024 − 64 − 3 = 957 de datos.',
      difficulty: 2,
      source: AI,
      topics: ['VSFS'],
    },
    {
      id: 'ai-37',
      kind: 'single',
      prompt: 'Con bloques de 4 KB, ¿cuántos objetos puede seguir un solo bloque de bitmap?',
      options: opts('4096', '1024', '512', '32768'),
      answer: ['d'],
      explanation:
        'Un bit por objeto: 4096 × 8 = 32768 bits. Por eso en casi todos los ejercicios alcanza con un bloque para cada bitmap. El error típico es contar un byte por objeto.',
      difficulty: 2,
      source: AI,
      topics: ['VSFS'],
    },
    {
      id: 'ai-38',
      kind: 'single',
      prompt:
        'En un VSFS la tabla de inodos empieza en el bloque 3, con bloques de 4 KB e inodos de 256 B. ¿En qué byte del disco empieza el inodo 32?',
      options: opts('8 KB', '12 KB', '20 KB', '32 KB'),
      answer: ['c'],
      explanation:
        'La tabla empieza en 3 × 4 KB = 12 KB y el inodo 32 está 32 × 256 = 8192 B más adelante: 12 KB + 8 KB = 20 KB, que es el bloque absoluto 5. Es el ejemplo de la diapo.',
      difficulty: 2,
      source: AI,
      topics: ['VSFS', 'inodos'],
    },
    {
      id: 'ai-39',
      kind: 'single',
      prompt:
        'Inodo FFS con 12 punteros directos, 1 indirecto, 1 doble y 1 triple; bloques de 4 KB y punteros de 4 B. ¿Cuál es el tamaño máximo de un archivo?',
      options: opts(
        '15 × 4 KB',
        '(12 + 3 × 1024) × 4 KB',
        '(12 + 1024 + 1024² + 1024³) × 4 KB, unos 4 TB',
        '1024³ bytes, 1 GB',
      ),
      answer: ['c'],
      explanation:
        'Cada bloque indirecto tiene P = 4096 / 4 = 1024 punteros. El indirecto suma P bloques, el doble P² y el triple P³; la suma da bloques y se multiplica por 4 KB. Domina el triple: 2³⁰ × 2¹² = 2⁴² B ≈ 4 TB.',
      difficulty: 3,
      source: AI,
      topics: ['índice multinivel'],
    },
    {
      id: 'ai-40',
      kind: 'single',
      prompt:
        'Mismo esquema FFS (12 directos, bloques de 4 KB, P = 1024), con el inodo fuera de memoria. ¿Cuántas lecturas a disco hacen falta para leer el bloque lógico 12 del archivo (el primero después de los directos)?',
      options: opts('1', '2', '3', '4'),
      answer: ['c'],
      explanation:
        'El bloque 12 está bajo el puntero indirecto: hay que leer el inodo, después el bloque indirecto para obtener el puntero y después el bloque de datos. Los bloques 0 a 11 cuestan 2 lecturas; los del doble indirecto, 4.',
      difficulty: 3,
      source: AI,
      topics: ['índice multinivel'],
    },
    {
      id: 'ai-41',
      kind: 'single',
      prompt: '¿Por qué el índice multinivel de FFS es un árbol deliberadamente desbalanceado?',
      options: opts(
        'Porque así todos los bloques se acceden con la misma cantidad de lecturas',
        'Porque la mayoría de los archivos son chicos y con los punteros directos les alcanza',
        'Porque los bloques indirectos son más rápidos que los directos',
        'Porque balancearlo requeriría un inodo por bloque',
      ),
      answer: ['b'],
      explanation:
        'El esquema apuesta a que casi todos los archivos son chicos: les alcanzan los punteros del inodo, sin lecturas extra. Sólo los grandes pagan uno, dos o tres niveles de indirección.',
      difficulty: 2,
      source: AI,
      topics: ['índice multinivel'],
    },

    // ---------------------------------------------------------------------
    // AI-generated questions — path resolution
    // ---------------------------------------------------------------------
    {
      id: 'ai-42',
      kind: 'single',
      prompt:
        'Sin caché, con cada directorio en un bloque y sin contar bloques indirectos, ¿cuántos inodos y bloques se leen con `cat /dir/x` (`x` es un archivo regular con contenido)?',
      options: opts('2 inodos y 2 bloques', '3 inodos y 2 bloques', '3 inodos y 3 bloques', '4 inodos y 4 bloques'),
      answer: ['c'],
      explanation:
        'Inodo de `/` y su bloque (encuentra `dir`), inodo de `dir` y su bloque (encuentra `x`), inodo de `x` y su bloque de datos, porque `cat` lee el contenido: 3 y 3.',
      difficulty: 2,
      source: AI,
      topics: ['resolución de paths'],
    },
    {
      id: 'ai-43',
      kind: 'single',
      prompt: 'Sin caché, con cada directorio en un bloque y sin contar bloques indirectos, ¿cuántos inodos y bloques se leen con `stat /dir/x` (`x` es un archivo regular con contenido)?',
      options: opts('3 inodos y 3 bloques', '2 inodos y 2 bloques', '3 inodos y 2 bloques', '2 inodos y 3 bloques'),
      answer: ['c'],
      explanation:
        'Se recorren `/` y `dir` (inodo y bloque de cada uno) y se lee el inodo de `x`, que tiene la metadata. `stat` no lee datos, así que el bloque de `x` no se toca: 3 inodos y 2 bloques. Lo mismo vale para `ls -l /dir/x`.',
      difficulty: 2,
      source: AI,
      topics: ['resolución de paths', 'stat'],
    },
    {
      id: 'ai-44',
      kind: 'single',
      prompt:
        '`/dir/y` es un *symlink* a `/dir/s/y`, un archivo regular. Sin caché, con cada directorio en un bloque y sin contar bloques indirectos, ¿cuántos inodos y bloques se leen con `cat /dir/y`?',
      options: opts('4 inodos y 4 bloques', '3 inodos y 3 bloques', '6 inodos y 6 bloques', '7 inodos y 7 bloques'),
      answer: ['d'],
      explanation:
        'Primero se resuelve `/dir/y`: `/`, `dir` y el inodo del *symlink* con su bloque, que tiene el texto `/dir/s/y` (3 y 3). Después se arranca de nuevo desde la raíz: `/`, `dir`, `s` y el inodo de `y` con su dato (4 y 4). En total, 7 y 7.',
      difficulty: 3,
      source: AI,
      topics: ['resolución de paths', 'links'],
    },
    {
      id: 'ai-45',
      kind: 'single',
      prompt:
        '`ln /dir/x /dir/h` y después `rm /dir/x`. Sin caché, con cada directorio en un bloque y sin contar bloques indirectos, ¿cuántos inodos y bloques se leen con `cat /dir/h`?',
      options: opts('3 inodos y 3 bloques', '6 inodos y 6 bloques', '4 inodos y 4 bloques', 'Ninguno: falla porque se borró `x`'),
      answer: ['a'],
      explanation:
        'Un *hard link* no agrega nada al recorrido: `h` es un *dentry* más que apunta al mismo inodo. Es igual que un `cat` de un archivo a dos niveles. El `rm` sólo bajó el contador de *links* de 2 a 1.',
      difficulty: 2,
      source: AI,
      topics: ['resolución de paths', 'links'],
    },
    {
      id: 'ai-46',
      kind: 'single',
      prompt: '¿Por qué `ls -l` de un directorio con muchos archivos cuesta más lecturas que `ls` sin `-l`?',
      options: opts(
        'Porque `-l` además lee el bloque de datos de cada archivo',
        'Porque `-l` hace `stat` de cada entrada y tiene que leer su inodo',
        'Porque `-l` lee el directorio dos veces',
        'No cuesta más: los dos leen lo mismo',
      ),
      answer: ['b'],
      explanation:
        'Para listar nombres alcanza con los *dentries* del bloque del directorio. `-l` muestra permisos, dueño, tamaño y fechas, que están en el inodo de cada archivo: un `stat` por entrada. Los datos de los archivos no se leen en ninguno de los dos casos.',
      difficulty: 2,
      source: AI,
      topics: ['resolución de paths', 'stat'],
    },
    {
      id: 'ai-47',
      kind: 'multiple',
      prompt: '¿Qué guarda un inodo y muestra `stat`?',
      options: opts(
        'Fecha del último acceso (*atime*)',
        'Fecha de la última modificación del contenido (*mtime*)',
        'Cantidad de *links*',
        'El *path* completo del archivo',
      ),
      answer: ['a', 'b', 'c'],
      explanation:
        'El inodo guarda fechas (*atime*, *mtime*, *ctime*), dueño, grupo, permisos, tamaño y el contador de *links*. El enunciado pide mantener al menos el último acceso y la última modificación. El *path* no está en el inodo: un archivo puede tener varios.',
      difficulty: 1,
      source: AI,
      topics: ['stat', 'inodos'],
    },

    // ---------------------------------------------------------------------
    // AI-generated questions — caches and persistence
    // ---------------------------------------------------------------------
    {
      id: 'ai-48',
      kind: 'single',
      prompt: 'Un programa hace `write` sobre un archivo de ext4, recibe OK y un segundo después se corta la luz. ¿Están los datos en el disco?',
      options: opts(
        'Sí: `write` no vuelve hasta que los datos están en el disco',
        'Sí, si el archivo se abrió sin `O_APPEND`',
        'No necesariamente: `write` sólo garantiza que llegaron al *page cache*; para persistir hace falta `fsync`',
        'No: `write` nunca escribe en disco, sólo `close` lo hace',
      ),
      answer: ['c'],
      explanation:
        'Es *buffered I/O*: el kernel escribe a disco "en algún momento". `fsync` fuerza los datos y la metadata; `fdatasync`, sólo los datos. `close` tampoco garantiza persistencia.',
      difficulty: 2,
      source: AI,
      topics: ['page cache', 'persistencia'],
    },
    {
      id: 'ai-49',
      kind: 'single',
      prompt: 'En Linux, ¿dónde está el *page cache* respecto de VFS?',
      options: opts(
        'Dentro de cada driver de disco',
        'Por encima de VFS: es común a todos los *filesystems*',
        'En la libc, en espacio de usuario',
        'En el controlador del disco, en hardware',
      ),
      answer: ['b'],
      explanation:
        'No es que cada FS implemente su caché: el *page cache* guarda páginas de cualquier archivo, sea del FS que sea, y lo maneja el sistema operativo en software. Por eso Linux usa bloques del tamaño de una página.',
      difficulty: 2,
      source: AI,
      topics: ['page cache', 'VFS'],
    },
    {
      id: 'ai-50',
      kind: 'single',
      prompt: '¿Qué diferencia hay entre `fflush` y `fsync`?',
      options: opts(
        'Ninguna: los dos fuerzan los datos al disco',
        '`fflush` vacía el *buffer* de stdio hacia el kernel; `fsync` fuerza lo que está en el *page cache* hacia el disco',
        '`fflush` es para archivos y `fsync` para *sockets*',
        '`fsync` vacía el *buffer* de stdio y `fflush` el *page cache*',
      ),
      answer: ['b'],
      explanation:
        'Hay dos capas: el *buffer* de la libc en el proceso y el *page cache* del kernel. `fflush` pasa los datos de la primera a la segunda con un `write`; `fsync` baja la segunda al disco. Para persistir hacen falta las dos.',
      difficulty: 2,
      source: AI,
      topics: ['page cache'],
    },
    {
      id: 'ai-51',
      kind: 'single',
      prompt:
        '`fisopfs` serializa toda su estructura en un único archivo `.fisopfs`. Si se monta con un archivo que todavía no existe, ¿cuál es el comportamiento razonable?',
      options: opts(
        'Se borra el directorio de montaje',
        'Se crea un *filesystem* vacío, con sólo el directorio raíz, y se guarda en ese archivo al persistir',
        'Se copia el *filesystem* del disco real',
        'Se usa `persistence_file.fisopfs` aunque se haya pasado otro nombre',
      ),
      answer: ['b'],
      explanation:
        'El enunciado no fija este caso: lo decide el grupo. Lo razonable es que la primera vez, sin nada que cargar, `init` arranque con un FS vacío que tiene sólo la raíz `/`. Al desmontar o en un `flush`, eso se escribe en el archivo elegido con `--filedisk`, y en el próximo montaje se carga de ahí.',
      difficulty: 2,
      source: AI,
      topics: ['persistencia'],
    },
    {
      id: 'ai-52',
      kind: 'single',
      prompt:
        'Sin caché, con cada directorio en un bloque y sin contar bloques indirectos, ¿cuántos inodos y bloques se leen con `cat /a/b/c/d` (`d` es un archivo regular con contenido)?',
      options: opts('4 inodos y 4 bloques', '5 inodos y 4 bloques', '4 inodos y 5 bloques', '5 inodos y 5 bloques'),
      answer: ['d'],
      explanation:
        'Hay 4 directorios en el camino (`/`, `a`, `b`, `c`): un inodo y un bloque de cada uno. Después el inodo de `d` y su bloque de datos, porque `cat` lee el contenido: 5 y 5. En general, con k directorios en el camino contando la raíz, `cat` lee k + 1 inodos y k + 1 bloques.',
      difficulty: 3,
      source: AI,
      topics: ['resolución de paths'],
    },
    {
      id: 'ai-53',
      kind: 'single',
      prompt:
        'Un VSFS de 2048 bloques de 4 KB con inodos de 128 B, con el criterio de la cátedra (en un disco de N bloques entran N archivos). ¿Cuántos bloques quedan para datos?',
      options: opts('1981', '1984', '1920', '2045'),
      answer: ['a'],
      explanation:
        'Hacen falta 2048 inodos; en un bloque entran 4096 / 128 = 32, así que la tabla ocupa 2048 / 32 = 64 bloques. Cada bitmap ocupa 1 bloque (2048 < 32768 bits) y hay 1 superbloque: 2048 − 64 − 1 − 1 − 1 = 1981. Olvidarse del superbloque da 1982; olvidarse de la tabla de inodos, 2045.',
      difficulty: 3,
      source: AI,
      topics: ['VSFS'],
    },
  ],
}
