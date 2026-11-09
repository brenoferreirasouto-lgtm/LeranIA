
import { describe, expect, it } from 'vitest'
import {
  learningCategories,
  lessons,
  placementQuestions,
  quizzes,
  levelForScore,
  type Question,
} from './course'

function validateQuestions(questions: Question[]) {
  expect(questions.length).toBeGreaterThan(0)

  for (const question of questions) {
    expect(question.prompt.trim()).not.toBe('')
    expect(question.topic.trim()).not.toBe('')

    expect(question.options.length).toBeGreaterThanOrEqual(2)

    expect(Number.isInteger(question.answer)).toBe(true)
    expect(question.answer).toBeGreaterThanOrEqual(0)
    expect(question.answer).toBeLessThan(question.options.length)

    expect(question.explanations).toHaveLength(
      question.options.length,
    )

    for (const option of question.options) {
      expect(option.trim()).not.toBe('')
    }

    for (const explanation of question.explanations) {
      expect(explanation.trim()).not.toBe('')
    }
  }
}

describe('Conteúdo do curso', () => {
  it('deve possuir categorias únicas e válidas', () => {
    expect(learningCategories.length).toBeGreaterThan(0)

    expect(new Set(learningCategories).size).toBe(
      learningCategories.length,
    )
  })

  it('deve possuir aulas com identificadores e números únicos', () => {
    expect(lessons.length).toBeGreaterThan(0)

    const ids = lessons.map((lesson) => lesson.id)
    const numbers = lessons.map((lesson) => lesson.number)

    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(numbers).size).toBe(numbers.length)
  })

  it('deve manter os dados obrigatórios de cada aula', () => {
    for (const lesson of lessons) {
      expect(lesson.id.trim()).not.toBe('')
      expect(lesson.title.trim()).not.toBe('')
      expect(lesson.description.trim()).not.toBe('')
      expect(lesson.duration.trim()).not.toBe('')
      expect(lesson.objective.trim()).not.toBe('')
      expect(lesson.practice.trim()).not.toBe('')

      expect(learningCategories).toContain(lesson.category)

      expect(lesson.number).toBeGreaterThan(0)
      expect(lesson.sections.length).toBeGreaterThan(0)

      expect(quizzes).toHaveProperty(lesson.quizId)

      for (const section of lesson.sections) {
        expect(section.title.trim()).not.toBe('')
        expect(section.body.trim()).not.toBe('')
      }
    }
  })
})

describe('Avaliação de nivelamento', () => {
  it('deve possuir perguntas válidas', () => {
    validateQuestions(placementQuestions)
  })
})

describe('Quizzes', () => {
  it('deve possuir quizzes com dados obrigatórios', () => {
    expect(Object.keys(quizzes).length).toBeGreaterThan(0)

    for (const [id, quiz] of Object.entries(quizzes)) {
      expect(id.trim()).not.toBe('')
      expect(quiz.title.trim()).not.toBe('')
      expect(quiz.description.trim()).not.toBe('')

      validateQuestions(quiz.questions)
    }
  })
})

describe('levelForScore', () => {
  it('deve classificar pontuações abaixo de 40% como iniciante', () => {
    expect(levelForScore(0, 100)).toBe('Iniciante')
    expect(levelForScore(39, 100)).toBe('Iniciante')
  })

  it('deve classificar pontuações entre 40% e menos de 75% como intermediário', () => {
    expect(levelForScore(40, 100)).toBe('Intermediário')
    expect(levelForScore(74, 100)).toBe('Intermediário')
  })

  it('deve classificar pontuações a partir de 75% como avançado', () => {
    expect(levelForScore(75, 100)).toBe('Avançado')
    expect(levelForScore(100, 100)).toBe('Avançado')
  })

  it('deve retornar iniciante quando o total de questões for zero', () => {
    expect(levelForScore(0, 0)).toBe('Iniciante')
  })

  it('deve utilizar a quantidade de perguntas do nivelamento como total padrão', () => {
    expect(levelForScore(0)).toBe('Iniciante')
  })
})
