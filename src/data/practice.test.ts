
import { describe, expect, it } from 'vitest'
import {
  promptComparisonExercises,
  verificationExercise,
} from './practice'

describe('Exercícios de comparação de prompts', () => {
  it('deve possuir exercícios cadastrados', () => {
    expect(promptComparisonExercises.length).toBeGreaterThan(0)
  })

  it('deve possuir identificadores únicos', () => {
    const ids = promptComparisonExercises.map(
      (exercise) => exercise.id,
    )

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('deve possuir prompts A e B válidos e diferentes', () => {
    for (const exercise of promptComparisonExercises) {
      expect(exercise.objective.trim()).not.toBe('')
      expect(exercise.promptA.trim()).not.toBe('')
      expect(exercise.promptB.trim()).not.toBe('')

      expect(exercise.promptA).not.toBe(exercise.promptB)

      expect(['A', 'B']).toContain(exercise.correctOption)

      expect(exercise.explanation.trim()).not.toBe('')
      expect(exercise.contrast.trim()).not.toBe('')
    }
  })
})

describe('Exercício de verificação de informações', () => {
  it('deve possuir informações de origem e conteúdo', () => {
    expect(verificationExercise.id.trim()).not.toBe('')
    expect(verificationExercise.sourceTitle.trim()).not.toBe('')
    expect(verificationExercise.sourceContext.trim()).not.toBe('')
    expect(verificationExercise.generatedText.trim()).not.toBe('')
    expect(verificationExercise.hallucination.trim()).not.toBe('')
  })

  it('deve possuir critérios de verificação', () => {
    expect(verificationExercise.criteria.length).toBeGreaterThan(0)

    const ids = verificationExercise.criteria.map(
      (criterion) => criterion.id,
    )

    expect(new Set(ids).size).toBe(ids.length)

    for (const criterion of verificationExercise.criteria) {
      expect(criterion.id.trim()).not.toBe('')
      expect(criterion.label.trim()).not.toBe('')
      expect(typeof criterion.isSatisfied).toBe('boolean')
      expect(criterion.explanation.trim()).not.toBe('')
    }
  })
})
