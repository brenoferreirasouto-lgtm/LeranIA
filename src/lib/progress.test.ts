
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  claimXp,
  createEmptyProgress,
  readProgress,
  saveProgress,
  storageKey,
} from './progress'

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('createEmptyProgress', () => {
  it('deve criar um progresso inicial vazio', () => {
    const progress = createEmptyProgress()

    expect(progress.version).toBe(1)
    expect(progress.profileName).toBe('')
    expect(progress.level).toBeNull()
    expect(progress.xp).toBe(0)
    expect(progress.completedLessons).toEqual([])
    expect(progress.projects).toEqual([])
    expect(progress.rewardClaims).toEqual([])
    expect(progress.promptDraft.context).toBe('')
  })
})

describe('readProgress', () => {
  it('deve retornar progresso vazio quando não existem dados salvos', () => {
    expect(readProgress()).toEqual(createEmptyProgress())
  })

  it('deve retornar progresso vazio quando o JSON está corrompido', () => {
    localStorage.setItem(storageKey, '{json inválido')

    expect(readProgress()).toEqual(createEmptyProgress())
  })

  it('deve rejeitar versões incompatíveis', () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ version: 2 }),
    )

    expect(readProgress()).toEqual(createEmptyProgress())
  })

  it('deve normalizar dados inválidos e limitar informações', () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        profileName: 'A'.repeat(70),
        xp: -10,
        completedLessons: ['lesson-1', 123],
        practiceResults: {
          valid: {
            score: 8,
            total: 5,
            completedAt: '2026-11-09',
            correctIds: ['question-1', 123],
          },
          invalid: {
            score: 2,
            total: 0,
            completedAt: '2026-11-09',
            correctIds: [],
          },
        },
        promptDraft: {
          context: 'Aprendizagem com IA',
          goal: 123,
        },
      }),
    )

    const progress = readProgress()

    expect(progress.profileName).toHaveLength(60)
    expect(progress.xp).toBe(0)
    expect(progress.completedLessons).toEqual(['lesson-1'])

    expect(progress.practiceResults.valid.score).toBe(5)
    expect(progress.practiceResults.valid.correctIds).toEqual([
  'question-1',
])

    expect(progress.practiceResults.invalid).toBeUndefined()

    expect(progress.promptDraft.context).toBe('Aprendizagem com IA')
    expect(progress.promptDraft.goal).toBe('')
  })
})

describe('saveProgress', () => {
  it('deve salvar o progresso quando existe atividade', () => {
    const progress = createEmptyProgress()
    progress.profileName = 'Bruno'
    progress.xp = 25

    expect(saveProgress(progress)).toBe(true)

    const saved = JSON.parse(
      localStorage.getItem(storageKey) ?? 'null',
    )

    expect(saved.profileName).toBe('Bruno')
    expect(saved.xp).toBe(25)
  })

  it('deve remover os dados quando o progresso está vazio', () => {
    localStorage.setItem(storageKey, 'dados anteriores')

    const progress = createEmptyProgress()

    expect(saveProgress(progress)).toBe(true)
    expect(localStorage.getItem(storageKey)).toBeNull()
  })

  it('deve retornar false quando o armazenamento falha', () => {
    const progress = createEmptyProgress()
    progress.profileName = 'Bruno'

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Armazenamento indisponível')
    })

    expect(saveProgress(progress)).toBe(false)
  })
})

describe('claimXp', () => {
  it('deve adicionar XP e registrar a recompensa', () => {
    const progress = createEmptyProgress()

    const updated = claimXp(progress, 'lesson-1', 50)

    expect(updated.xp).toBe(50)
    expect(updated.rewardClaims).toContain('lesson-1')
  })

  it('não deve conceder XP duas vezes pela mesma recompensa', () => {
    const progress = createEmptyProgress()

    const firstClaim = claimXp(progress, 'lesson-1', 50)
    const secondClaim = claimXp(firstClaim, 'lesson-1', 50)

    expect(secondClaim.xp).toBe(50)
    expect(secondClaim.rewardClaims).toEqual(['lesson-1'])
    expect(secondClaim).toBe(firstClaim)
  })
})
