export type ProjectStep = {
  id: string
  title: string
  guide: string
  complete: boolean
}

export type Project = {
  id: string
  title: string
  idea: string
  objective: string
  createdAt: string
  notes: string
  steps: ProjectStep[]
}

export type PromptDraft = {
  context: string
  goal: string
  audience: string
  inputs: string
  format: string
  constraints: string
  result: string
}

export type QuizResult = {
  score: number
  total: number
  completedAt: string
  incorrectTopics: string[]
}

export type PracticeResult = {
  score: number
  total: number
  completedAt: string
  correctIds: string[]
}

export type Progress = {
  version: 1
  profileName: string
  level: string | null
  placementScore: number | null
  xp: number
  completedLessons: string[]
  reflections: Record<string, string>
  quizResults: Record<string, QuizResult>
  practiceResults: Record<string, PracticeResult>
  rewardClaims: string[]
  projects: Project[]
  lastLessonId: string | null
  promptDraft: PromptDraft
}

export const storageKey = "learnai.progress.v1"

export const emptyPromptDraft: PromptDraft = {
  context: "",
  goal: "",
  audience: "",
  inputs: "",
  format: "",
  constraints: "",
  result: "",
}

export function createEmptyProgress(): Progress {
  return {
    version: 1,
    profileName: "",
    level: null,
    placementScore: null,
    xp: 0,
    completedLessons: [],
    reflections: {},
    quizResults: {},
    practiceResults: {},
    rewardClaims: [],
    projects: [],
    lastLessonId: null,
    promptDraft: { ...emptyPromptDraft },
  }
}

export function readProgress(): Progress {
  const empty = createEmptyProgress()
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return empty
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== "object") return empty
    const data = value as Partial<Progress>
    if (data.version !== 1) return empty
    const draft =
      data.promptDraft && typeof data.promptDraft === "object"
        ? data.promptDraft
        : empty.promptDraft
    const practiceResults: Record<string, PracticeResult> = {}
    if (data.practiceResults && typeof data.practiceResults === "object") {
      for (const [id, value] of Object.entries(data.practiceResults)) {
        if (!value || typeof value !== "object") continue
        const result = value as Partial<PracticeResult>
        if (
          typeof result.score !== "number" ||
          !Number.isFinite(result.score) ||
          typeof result.total !== "number" ||
          !Number.isFinite(result.total) ||
          result.total < 1 ||
          typeof result.completedAt !== "string" ||
          !Array.isArray(result.correctIds)
        )
          continue
        practiceResults[id] = {
          score: Math.max(0, Math.min(result.total, result.score)),
          total: result.total,
          completedAt: result.completedAt,
          correctIds: result.correctIds.filter(
            (item): item is string => typeof item === "string",
          ),
        }
      }
    }
    return {
      ...empty,
      profileName:
        typeof data.profileName === "string"
          ? data.profileName.slice(0, 60)
          : "",
      level: typeof data.level === "string" ? data.level : null,
      placementScore:
        typeof data.placementScore === "number" ? data.placementScore : null,
      xp:
        typeof data.xp === "number" && Number.isFinite(data.xp)
          ? Math.max(0, data.xp)
          : 0,
      completedLessons: Array.isArray(data.completedLessons)
        ? data.completedLessons.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
      reflections:
        data.reflections && typeof data.reflections === "object"
          ? data.reflections
          : {},
      quizResults:
        data.quizResults && typeof data.quizResults === "object"
          ? data.quizResults
          : {},
      practiceResults,
      rewardClaims: Array.isArray(data.rewardClaims)
        ? data.rewardClaims.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
      projects: Array.isArray(data.projects)
        ? data.projects.filter((item): item is Project =>
            Boolean(
              item &&
                typeof item.id === "string" &&
                typeof item.title === "string" &&
                Array.isArray(item.steps),
            ),
          )
        : [],
      lastLessonId:
        typeof data.lastLessonId === "string" ? data.lastLessonId : null,
      promptDraft: {
        context: typeof draft.context === "string" ? draft.context : "",
        goal: typeof draft.goal === "string" ? draft.goal : "",
        audience: typeof draft.audience === "string" ? draft.audience : "",
        inputs: typeof draft.inputs === "string" ? draft.inputs : "",
        format: typeof draft.format === "string" ? draft.format : "",
        constraints:
          typeof draft.constraints === "string" ? draft.constraints : "",
        result: typeof draft.result === "string" ? draft.result : "",
      },
    }
  } catch {
    return empty
  }
}

export function saveProgress(progress: Progress): boolean {
  try {
    const hasActivity =
      progress.profileName.trim() ||
      progress.level ||
      progress.placementScore !== null ||
      progress.xp > 0 ||
      progress.completedLessons.length > 0 ||
      Object.keys(progress.reflections).length > 0 ||
      Object.keys(progress.quizResults).length > 0 ||
      Object.keys(progress.practiceResults).length > 0 ||
      progress.projects.length > 0 ||
      progress.rewardClaims.length > 0 ||
      Object.values(progress.promptDraft).some(Boolean)
    if (!hasActivity) {
      window.localStorage.removeItem(storageKey)
      return true
    }
    window.localStorage.setItem(storageKey, JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}

export function claimXp(
  progress: Progress,
  claimId: string,
  amount: number,
): Progress {
  if (progress.rewardClaims.includes(claimId)) return progress
  return {
    ...progress,
    rewardClaims: [...progress.rewardClaims, claimId],
    xp: progress.xp + amount,
  }
}

export const projectTemplate: Omit<ProjectStep, "complete">[] = [
  {
    id: "problem",
    title: "Defina o problema",
    guide:
      "Quem enfrenta esse problema e em que situação? Registre o que você já sabe e o que ainda precisa investigar.",
  },
  {
    id: "evidence",
    title: "Pesquise e confira",
    guide:
      "Reúna fontes confiáveis, compare evidências e anote limites ou dúvidas. Não trate uma resposta de IA como fonte primária.",
  },
  {
    id: "prototype",
    title: "Crie uma primeira versão",
    guide:
      "Escolha um resultado pequeno que possa testar. Use IA como apoio para explorar alternativas e mantenha as decisões com você.",
  },
  {
    id: "review",
    title: "Revise e apresente",
    guide:
      "Teste o resultado com critérios definidos. Registre o que mudou, o que foi verificado e como a autoria foi preservada.",
  },
]
