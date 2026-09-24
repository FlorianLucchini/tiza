import type { Quiz, Subject } from './types'
import { tp1Shell } from './fiuba/sistemas-operativos/tp1-shell'

export const subjects: Subject[] = [
  {
    id: 'sistemas-operativos',
    name: 'Sistemas Operativos',
    code: 'TA043 · 95.03',
    institution: 'FIUBA',
    career: 'Ingeniería en Informática',
    description: 'Kernel, procesos, scheduling, memoria, concurrencia y filesystems. Cátedra FISOP.',
    quizzes: [tp1Shell],
  },
]

export function findSubject(subjectId: string | undefined): Subject | undefined {
  return subjects.find((s) => s.id === subjectId)
}

export function findQuiz(subject: Subject | undefined, quizId: string | undefined): Quiz | undefined {
  return subject?.quizzes.find((q) => q.id === quizId)
}
