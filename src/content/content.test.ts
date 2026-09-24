import { describe, expect, it } from 'vitest'
import { subjects } from './index'

// Guards content integrity: a malformed question should fail CI, not confuse a student.
describe('content', () => {
  const quizzes = subjects.flatMap((s) => s.quizzes.map((q) => ({ subject: s, quiz: q })))

  it('has unique subject and quiz ids', () => {
    expect(new Set(subjects.map((s) => s.id)).size).toBe(subjects.length)
    for (const s of subjects) expect(new Set(s.quizzes.map((q) => q.id)).size).toBe(s.quizzes.length)
  })

  for (const { subject, quiz } of quizzes) {
    describe(`${subject.id}/${quiz.id}`, () => {
      it('has unique question ids', () => {
        const ids = quiz.questions.map((q) => q.id)
        expect(new Set(ids).size).toBe(ids.length)
      })

      for (const q of quiz.questions) {
        it(`${q.id} is well formed`, () => {
          const optionIds = q.options.map((o) => o.id)
          expect(new Set(optionIds).size).toBe(optionIds.length)
          expect(q.options.length).toBeGreaterThanOrEqual(2)
          expect(q.answer.length).toBeGreaterThan(0)
          for (const a of q.answer) expect(optionIds).toContain(a)
          if (q.kind === 'single') expect(q.answer).toHaveLength(1)
          expect(q.prompt.trim()).not.toBe('')
          expect(q.explanation.trim()).not.toBe('')
          expect(q.topics.length).toBeGreaterThan(0)
          // Real and generated questions are told apart by their id prefix as well as their source.
          expect(q.id.startsWith(q.source.kind === 'real' ? 'real-' : 'ai-')).toBe(true)
        })
      }
    })
  }
})

describe('prepareOptions', () => {
  it('never leaves generated answers in the first position for most questions when unshuffled', async () => {
    const { prepareOptions } = await import('../lib/quiz')
    const ai = subjects.flatMap((s) => s.quizzes.flatMap((q) => q.questions)).filter((q) => q.source.kind === 'ai')
    const first = ai.filter((q) => q.answer.includes(prepareOptions(q, false).options[0].id)).length
    // With 4 options a fair order puts the answer first ~25% of the time.
    expect(first / ai.length).toBeLessThan(0.5)
  })
})
