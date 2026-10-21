import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react"
import {
  levelForScore,
  learningCategories,
  lessons,
  placementQuestions,
  quizzes,
  type Level,
  type LearningCategory,
  type Lesson,
  type Question,
} from "./data/course"
import {
  promptComparisonExercises,
  verificationExercise,
  type ComparisonOption,
} from "./data/practice"
import {
  claimXp,
  createEmptyProgress,
  projectTemplate,
  readProgress,
  saveProgress,
  type Progress,
  type Project,
  type PracticeResult,
  type QuizResult,
} from "./lib/progress"

type Page = "welcome" | "dashboard" | "path" | "lesson" | "quiz" | "placement" | "studio" | "projects" | "journey" | "plus" | "profile" | "prompt-practice" | "verification-practice"
type PracticeKind = "compare" | "verify"
type Theme = "light" | "dark"
type IconName = "arrow" | "award" | "book" | "check" | "chevron" | "clock" | "compass" | "copy" | "flag" | "grid" | "layers" | "light" | "lock" | "menu" | "moon" | "plus" | "search" | "shield" | "spark" | "sun" | "target" | "user" | "x"
type NavigationItem = {
  id: Page
  label: string
  icon: IconName
}
type IconProps = {
  name: IconName
  size?: number
}
type QuizContent = {
  title: string
  description: string
  questions: Question[]
}
type CreateProjectInput = {
  title: string
  idea: string
  objective: string
}
type PracticeSubmission = {
  activityId: string
  score: number
  total: number
  correctIds: string[]
  xpPerCorrect: number
}

const navigation: NavigationItem[] = [
  { id: "dashboard", label: "Visão geral", icon: "grid" },
  { id: "path", label: "Trilha de aprendizagem", icon: "layers" },
  { id: "studio", label: "Construtor de prompts", icon: "spark" },
  { id: "projects", label: "Projetos autorais", icon: "light" },
  { id: "journey", label: "Minha evolução", icon: "award" },
  { id: "plus", label: "Learn AI Plus", icon: "target" },
]

const quizToLesson: Record<string, string> = {
  foundations: "generative-ai",
  hallucinations: "limitations",
  privacy: "privacy",
  "prompt-comparison": "prompting",
  verification: "verification",
  "responsible-use": "responsible-use",
  "advanced-prompting": "advanced-prompting",
  "research-synthesis": "research-synthesis",
  "professional-writing": "professional-writing",
  "data-analysis": "data-analysis",
  "software-development": "software-development",
  "workflow-automation": "workflow-automation",
  "ai-by-profession": "ai-by-profession",
  "assistants-and-agents": "assistants-and-agents",
  "integrative-project": "integrative-project",
}

const themeStorageKey = "learnai.theme.v1"
const localSignOutStorageKey = "learnai.session.signed-out.v1"

function readLocalSignOut(): boolean {
  try {
    return window.localStorage.getItem(localSignOutStorageKey) === "true"
  } catch {
    return false
  }
}

function saveLocalSignOut(signedOut: boolean): boolean {
  try {
    if (signedOut) window.localStorage.setItem(localSignOutStorageKey, "true")
    else window.localStorage.removeItem(localSignOutStorageKey)
    return true
  } catch {
    return false
  }
}

function readTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(themeStorageKey)
    if (saved === "light" || saved === "dark") return saved
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  } catch {
    return "light"
  }
}

function Icon({ name, size = 20 }: IconProps) {
  const common = {
    fill: "none",
    height: size,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    width: size,
    "aria-hidden": true as const,
    focusable: false as const,
  }
  const paths: Record<IconName, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    award: (
      <>
        <circle cx="12" cy="8" r="5" />
        <path d="m8.5 12-1 9 4.5-2 4.5 2-1-9" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5zM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5z" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
      </>
    ),
    flag: (
      <>
        <path d="M5 21V4m0 1h10l-2 4 2 4H5" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    light: (
      <>
        <path d="M9 18h6m-5 3h4m3-7a7 7 0 1 0-10 0c1.2.8 2 1.8 2 3h6c0-1.2.8-2.2 2-3Z" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 1 1 8 0v3" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    moon: <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.6 8.6 0 1 0 20.9 13Z" />,
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 4 4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4.7 2.8 8 7 10 4.2-2 7-5.3 7-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
        <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    x: (
      <>
        <path d="m18 6-12 12M6 6l12 12" />
      </>
    ),
  }
  return (
    <svg {...common} className="icon">
      {paths[name]}
    </svg>
  )
}

function Brand() {
  return (
    <span
      className="brand"
      role="img"
      aria-label="Learn AI"
    >
      <span className="brand-image-frame" aria-hidden="true">
        <img className="brand-image" src={`${import.meta.env.BASE_URL}assets/learn-ai-logo.png`} alt="" />
        <img className="brand-image brand-image-white-text" src={`${import.meta.env.BASE_URL}assets/learn-ai-logo.png`} alt="" />
      </span>
    </span>
  )
}

function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  type = "button",
  disabled = false,
  className = "",
}: {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "brand" | "secondary" | "quiet" | "danger"
  icon?: IconName
  type?: "button" | "submit"
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      className={`button button-${variant} ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <Icon name={icon} size={17} />}
      {children}
    </button>
  )
}

function ThemeToggle({
  theme,
  onToggle,
  compact = false,
}: {
  theme: Theme
  onToggle: () => void
  compact?: boolean
}) {
  const nextTheme = theme === "dark" ? "light" : "dark"
  return (
    <button
      aria-label={`Ativar tema ${nextTheme === "dark" ? "escuro" : "claro"}`}
      aria-pressed={theme === "dark"}
      className={`theme-toggle ${compact ? "theme-toggle-compact" : ""}`}
      onClick={onToggle}
      type="button"
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
      {!compact && <span>Tema {theme === "dark" ? "escuro" : "claro"}</span>}
    </button>
  )
}

function PageTitle({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="page-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-title-actions">{actions}</div>}
    </header>
  )
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconName
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={23} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

function localWeekKey(value: Date) {
  const monday = new Date(value.getFullYear(), value.getMonth(), value.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`
}

function completedThisWeek(result?: PracticeResult) {
  if (!result) return false
  const date = new Date(result.completedAt)
  return Number.isFinite(date.getTime()) && localWeekKey(date) === localWeekKey(new Date())
}

function PracticeProgress({ step, total }: { step: number; total: number }) {
  return (
    <div
      aria-label={`Desafio ${step} de ${total}`}
      aria-valuemax={total}
      aria-valuemin={0}
      aria-valuenow={step}
      className="practice-step-track"
      role="progressbar"
    >
      <span style={{ width: `${(step / total) * 100}%` }} />
    </div>
  )
}

function PromptComparisonActivity({
  onComplete,
  onBack,
}: {
  onComplete: (results: PracticeSubmission[]) => void
  onBack: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<ComparisonOption | null>(null)
  const [answers, setAnswers] = useState<Record<string, ComparisonOption>>({})
  const [checked, setChecked] = useState(false)
  const [finished, setFinished] = useState(false)
  const exercise = promptComparisonExercises[currentIndex]
  const score = promptComparisonExercises.filter(
    (item) => answers[item.id] === item.correctOption,
  ).length

  function checkAnswer() {
    if (!selected || checked) return
    setAnswers((current) => ({ ...current, [exercise.id]: selected }))
    setChecked(true)
  }

  function continueActivity() {
    if (!checked) return
    if (currentIndex < promptComparisonExercises.length - 1) {
      setCurrentIndex((current) => current + 1)
      setSelected(null)
      setChecked(false)
      return
    }
    const results = promptComparisonExercises.map((item) => {
      const correct = answers[item.id] === item.correctOption
      return {
        activityId: item.id,
        score: correct ? 1 : 0,
        total: 1,
        correctIds: correct ? ["answer"] : [],
        xpPerCorrect: 5,
      }
    })
    onComplete(results)
    setFinished(true)
  }

  function restart() {
    setCurrentIndex(0)
    setSelected(null)
    setAnswers({})
    setChecked(false)
    setFinished(false)
  }

  if (finished) {
    return (
      <section className="practice-activity">
        <PageTitle
          eyebrow="LABORATÓRIO DE PROMPTS"
          title="Comparação concluída"
          description="Cada resposta mostrou como contexto, limites e critérios tornam uma instrução mais útil."
        />
        <div className="practice-finish-panel">
          <span className="practice-finish-mark"><Icon name={score === 3 ? "award" : "spark"} size={25} /></span>
          <span className="eyebrow">SEU RESULTADO</span>
          <h2>{score} de 3 comparações corretas</h2>
          <p>Os XP são concedidos por acerto e uma única vez por desafio. Você pode refazer para revisar o raciocínio, sem perder progresso anterior.</p>
          <div className="practice-finish-actions">
            <Button onClick={onBack}>Voltar à trilha</Button>
            <Button variant="secondary" onClick={restart}>Refazer atividade</Button>
          </div>
        </div>
      </section>
    )
  }

  const selectedIsCorrect = selected === exercise.correctOption
  return (
    <section className="practice-activity">
      <PageTitle
        eyebrow="LABORATÓRIO DE PROMPTS · +5 XP POR ACERTO"
        title="Qual prompt é mais eficiente?"
        description="Compare instruções para o mesmo objetivo. Procure contexto suficiente, critérios claros e limites contra suposições."
        actions={<Button variant="secondary" onClick={onBack}>Voltar à trilha</Button>}
      />
      <article className="practice-workspace">
        <div className="practice-workspace-heading">
          <div>
            <span className="eyebrow">DESAFIO {String(currentIndex + 1).padStart(2, "0")} DE {promptComparisonExercises.length}</span>
            <h2>Objetivo da tarefa</h2>
            <p>{exercise.objective}</p>
          </div>
          <span className="practice-reward"><Icon name="spark" size={15} /> +5 XP</span>
        </div>
        <PracticeProgress step={currentIndex + 1} total={promptComparisonExercises.length} />
        <div aria-label="Escolha o prompt mais eficiente" className="prompt-comparison-grid" role="group">
          {(["A", "B"] as const).map((option) => {
            const prompt = option === "A" ? exercise.promptA : exercise.promptB
            const isCorrect = checked && option === exercise.correctOption
            const isWrongChoice = checked && option === selected && !selectedIsCorrect
            return (
              <button
                aria-pressed={selected === option}
                className={`prompt-choice ${selected === option ? "prompt-choice-selected" : ""} ${isCorrect ? "prompt-choice-correct" : ""} ${isWrongChoice ? "prompt-choice-wrong" : ""}`}
                disabled={checked}
                key={option}
                onClick={() => setSelected(option)}
                type="button"
              >
                <span className="prompt-choice-heading">
                  <strong>Prompt {option}</strong>
                  <span>{selected === option ? "Selecionado" : "Sua escolha"}</span>
                </span>
                <span className="prompt-choice-copy">{prompt}</span>
                {isCorrect && <span className="prompt-choice-status"><Icon name="check" size={14} /> Mais eficiente</span>}
                {isWrongChoice && <span className="prompt-choice-status">Sua escolha</span>}
              </button>
            )
          })}
        </div>
        {checked && (
          <div className={`practice-feedback ${selectedIsCorrect ? "practice-feedback-correct" : "practice-feedback-review"}`} aria-live="polite" role="status">
            <strong><Icon name={selectedIsCorrect ? "check" : "light"} size={16} />{selectedIsCorrect ? "Boa comparação" : `O Prompt ${exercise.correctOption} é mais eficiente`}</strong>
            <p>{exercise.explanation}</p>
            <p>{exercise.contrast}</p>
          </div>
        )}
        <div className="practice-action-row">
          <span>{checked ? `${score} acerto${score === 1 ? "" : "s"} nesta atividade` : "O feedback aparece após conferir sua escolha."}</span>
          {checked ? (
            <Button icon="arrow" onClick={continueActivity}>{currentIndex === promptComparisonExercises.length - 1 ? "Ver resultado" : "Próximo desafio"}</Button>
          ) : (
            <Button disabled={!selected} onClick={checkAnswer}>Conferir escolha</Button>
          )}
        </div>
      </article>
    </section>
  )
}

function InformationVerificationActivity({
  onComplete,
  onBack,
}: {
  onComplete: (results: PracticeSubmission[]) => void
  onBack: () => void
}) {
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const exercise = verificationExercise
  const score = exercise.criteria.filter(
    (criterion) => (checks[criterion.id] ?? false) === criterion.isSatisfied,
  ).length

  function evaluate() {
    if (submitted) return
    const correctIds = exercise.criteria
      .filter((criterion) => (checks[criterion.id] ?? false) === criterion.isSatisfied)
      .map((criterion) => criterion.id)
    onComplete([{
      activityId: exercise.id,
      score: correctIds.length,
      total: exercise.criteria.length,
      correctIds,
      xpPerCorrect: 3,
    }])
    setSubmitted(true)
  }

  function restart() {
    setChecks({})
    setSubmitted(false)
  }

  return (
    <section className="practice-activity">
      <PageTitle
        eyebrow="VERIFICAÇÃO DE INFORMAÇÕES · +3 XP POR CRITÉRIO"
        title="Confira antes de confiar"
        description="Leia a resposta simulada, confronte cada afirmação com a evidência disponível e marque os critérios que estão atendidos."
        actions={<Button variant="secondary" onClick={onBack}>Voltar à trilha</Button>}
      />
      <div className="verification-layout">
        <div className="verification-evidence-column">
          <section aria-labelledby="generated-answer-title" className="generated-answer">
            <div className="generated-answer-label"><Icon name="spark" size={15} /> RESPOSTA SIMULADA DE UMA IA</div>
            <h2 id="generated-answer-title">Texto para analisar</h2>
            <blockquote>{exercise.generatedText}</blockquote>
            <small>Este texto é um exemplo didático, não foi produzido por uma chamada de IA em tempo real.</small>
          </section>
          <section className="evidence-card" aria-labelledby="evidence-title">
            <span className="eyebrow">EVIDÊNCIA DISPONÍVEL</span>
            <h2 id="evidence-title">{exercise.sourceTitle}</h2>
            <p>{exercise.sourceContext}</p>
            <span className="evidence-note"><Icon name="shield" size={14} /> Dados simulados para este exercício; não representam uma pesquisa real.</span>
          </section>
        </div>
        <section className="verification-checklist" aria-labelledby="checklist-title">
          <span className="eyebrow">CHECKLIST DE VERIFICAÇÃO</span>
          <h2 id="checklist-title">O que a evidência confirma?</h2>
          <p>Marque apenas os critérios que você considera atendidos pelo texto e pela base apresentada.</p>
          <div className="verification-criteria">
            {exercise.criteria.map((criterion) => {
              const answer = checks[criterion.id] ?? false
              const isCorrect = submitted && answer === criterion.isSatisfied
              const isIncorrect = submitted && !isCorrect
              return (
                <label className={`verification-criterion ${isCorrect ? "criterion-correct" : ""} ${isIncorrect ? "criterion-incorrect" : ""}`} htmlFor={`check-${criterion.id}`} key={criterion.id}>
                  <input
                    checked={answer}
                    disabled={submitted}
                    id={`check-${criterion.id}`}
                    onChange={(event) => setChecks((current) => ({ ...current, [criterion.id]: event.target.checked }))}
                    type="checkbox"
                  />
                  <span className="criterion-copy">
                    <strong>{criterion.label}</strong>
                    {submitted && <small>{criterion.explanation}</small>}
                  </span>
                  {submitted && <span className="criterion-status">{isCorrect ? "Correto" : "Revise"}</span>}
                </label>
              )
            })}
          </div>
          {!submitted ? (
            <div className="practice-action-row">
              <span>São {exercise.criteria.length} verificações objetivas.</span>
              <Button onClick={evaluate}>Avaliar checklist</Button>
            </div>
          ) : (
            <div className="verification-result" aria-live="polite" role="status">
              <strong>{score} de {exercise.criteria.length} critérios identificados corretamente</strong>
              <p>{score === exercise.criteria.length ? "Excelente: você conferiu fonte, data, cálculo e consistência." : "Use os comentários de cada critério para revisar a evidência. Refazer não concede XP duplicado."}</p>
              <div className="practice-action-row">
                <span>Conquista: verificador atento ao acertar 3 de 4 critérios.</span>
                <Button variant="secondary" onClick={restart}>Tentar novamente</Button>
              </div>
            </div>
          )}
        </section>
      </div>
      {submitted && (
        <section className="hallucination-reveal" aria-labelledby="hallucination-title">
          <span className="eyebrow">PONTO IMPRECISO IDENTIFICADO</span>
          <h2 id="hallucination-title">O que a resposta extrapolou</h2>
          <blockquote>“45% dos participantes usam IA generativa diariamente.”</blockquote>
          <p>{exercise.hallucination}</p>
        </section>
      )}
    </section>
  )
}

function Welcome({
  onCreate,
  theme,
  onToggleTheme,
  isReturning,
  initialName,
}: {
  onCreate: (name: string) => void
  theme: Theme
  onToggleTheme: () => void
  isReturning: boolean
  initialName: string
}) {
  const [name, setName] = useState(initialName)
  function submit(event: FormEvent) {
    event.preventDefault()
    if (name.trim()) onCreate(name.trim().slice(0, 60))
  }
  return (
    <main
      className="welcome-page"
      style={{
        "--welcome-background-image": `url("${import.meta.env.BASE_URL}assets/learnai-hero-desktop.png")`,
      } as CSSProperties}
    >
      <section className="welcome-story">
        <Brand />
        <div className="welcome-copy">
          <span className="eyebrow eyebrow-light">
            Aprender. Praticar. Criar.
          </span>
          <h1>
            Use IA com mais <span>intenção.</span>
          </h1>
          <p>
            Uma jornada prática para fazer perguntas melhores, avaliar respostas
            com cuidado e transformar conhecimento em projetos seus.
          </p>
          <div className="welcome-principles">
            <span>
              <Icon name="shield" size={17} /> Pensamento crítico
            </span>
            <span>
              <Icon name="light" size={17} /> Autoria humana
            </span>
          </div>
        </div>
        <div className="story-foot">
          APRENDIZAGEM APLICADA <span>•</span> IA RESPONSÁVEL
        </div>
      </section>
      <section className="welcome-form-wrap">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <div className="welcome-form">
          <span className="step-label">SEU ESPAÇO DE APRENDIZAGEM</span>
          <h2>{isReturning ? "Continue seu percurso" : "Comece por aqui"}</h2>
          <p>
            {isReturning
              ? "Seu perfil e progresso continuam salvos neste navegador. Confirme seu nome para continuar."
              : "Crie um perfil local para acompanhar seu percurso neste navegador."}
          </p>
          <form onSubmit={submit}>
            <label htmlFor="learner-name">
              {isReturning ? "Nome de exibição" : "Como podemos chamar você?"}
            </label>
            <input
              id="learner-name"
              autoComplete="name"
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              placeholder="Seu nome"
              required
              value={name}
            />
            <Button className="full-button" icon="arrow" type="submit">
              {isReturning ? "Continuar meu percurso" : "Criar meu espaço"}
            </Button>
          </form>
          <div className="local-notice">
            <Icon name="lock" size={16} />
            <span>
              <strong>Perfil local, sem autenticação.</strong>{" "}
              {isReturning
                ? "Este perfil não usa senha; qualquer pessoa com acesso a este navegador pode reabri-lo."
                : "Seus dados ficam neste navegador. Ainda não há conta, senha nem sincronização entre dispositivos."}
            </span>
          </div>
          <div className="welcome-meta">
            Sem coleta de dados externos <span>·</span> Sem integração com IA ou
            pagamentos
          </div>
        </div>
      </section>
    </main>
  )
}

function Placement({
  onComplete,
  onClose,
}: {
  onComplete: (score: number, level: Level) => void
  onClose: () => void
}) {
  const [step, setStep] = useState(-1)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const score = answers.reduce(
    (total, answer, index) =>
      total + (answer === placementQuestions[index]?.answer ? 1 : 0),
    0,
  )
  const level = levelForScore(score)
  if (finished)
    return (
      <main className="focus-view">
        <div className="assessment-result">
          <button className="text-action" onClick={onClose}>
            <Icon name="chevron" size={16} /> Voltar
          </button>
          <span className="result-mark">
            <Icon name="award" size={28} />
          </span>
          <span className="eyebrow">SEU PONTO DE PARTIDA</span>
          <h1>Nível {level}</h1>
          <p>
            Você acertou {score} de {placementQuestions.length} questões. A
            classificação usa faixas claras: iniciante abaixo de 40%,
            intermediário de 40% a 74% e avançado a partir de 75%.
          </p>
          <div className="recommendation-box">
            <span className="eyebrow">PRÓXIMA ETAPA</span>
            <strong>
              {level === "Iniciante"
                ? lessons[0].title
                : level === "Intermediário"
                  ? lessons[3].title
                  : lessons[4].title}
            </strong>
            <span>
              Todo o conteúdo continua disponível; esta sugestão só organiza por
              onde começar.
            </span>
          </div>
          <Button icon="arrow" onClick={() => onComplete(score, level)}>
            Começar minha trilha
          </Button>
        </div>
      </main>
    )
  if (step < 0)
    return (
      <main className="focus-view">
        <div className="assessment-card">
          <button className="text-action" onClick={onClose}>
            <Icon name="chevron" size={16} /> Voltar ao painel
          </button>
          <span className="assessment-icon">
            <Icon name="compass" size={26} />
          </span>
          <span className="eyebrow">AVALIAÇÃO INICIAL · 6 QUESTÕES</span>
          <h1>Onde você está na jornada?</h1>
          <p>
            Uma breve avaliação ajuda a sugerir um ponto de partida. Ela não
            limita o acesso aos módulos.
          </p>
          <div className="assessment-topics">
            <span>Fundamentos</span>
            <span>Prompts</span>
            <span>Verificação</span>
            <span>Privacidade</span>
          </div>
          <Button icon="arrow" onClick={() => setStep(0)}>
            Iniciar avaliação
          </Button>
        </div>
      </main>
    )
  const question = placementQuestions[step]
  function next() {
    if (selected === null) return
    const nextAnswers = [...answers]
    nextAnswers[step] = selected
    setAnswers(nextAnswers)
    setSelected(null)
    if (step === placementQuestions.length - 1) setFinished(true)
    else setStep(step + 1)
  }
  return (
    <main className="focus-view">
      <div className="question-card">
        <div className="question-top">
          <button className="text-action" onClick={onClose}>
            <Icon name="chevron" size={16} /> Sair
          </button>
          <span>
            {step + 1}{" "}
            <span className="muted">/ {placementQuestions.length}</span>
          </span>
        </div>
        <div className="progress-track">
          <span
            style={{
              width: `${((step + 1) / placementQuestions.length) * 100}%`,
            }}
          />
        </div>
        <span className="eyebrow">{question.topic.toUpperCase()}</span>
        <h1>{question.prompt}</h1>
        <div className="answer-options">
          {question.options.map((option, index) => (
            <button
              key={option}
              className={`answer-option ${
                selected === index ? "selected" : ""
              }`}
              onClick={() => setSelected(index)}
              aria-pressed={selected === index}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>
              <span className="option-radio" />
            </button>
          ))}
        </div>
        <div className="question-footer">
          <span>Escolha a alternativa mais adequada.</span>
          <Button icon="arrow" onClick={next} disabled={selected === null}>
            {step === placementQuestions.length - 1
              ? "Ver resultado"
              : "Próxima"}
          </Button>
        </div>
      </div>
    </main>
  )
}

function Dashboard({
  progress,
  onPage,
  onLesson,
  onQuiz,
  onPlacement,
  onPractice,
}: {
  progress: Progress
  onPage: (page: Page) => void
  onLesson: (id: string) => void
  onQuiz: (id: string) => void
  onPlacement: () => void
  onPractice: (kind: PracticeKind) => void
}) {
  const completeCount = progress.completedLessons.length
  const percent = Math.round((completeCount / lessons.length) * 100)
  const canResumeLastLesson = Boolean(
    progress.lastLessonId &&
      lessons.some((lesson) => lesson.id === progress.lastLessonId) &&
      !progress.completedLessons.includes(progress.lastLessonId),
  )
  const recommendation = useMemo(() => {
    const latestIncorrect = Object.entries(progress.quizResults)
      .sort((a, b) => b[1].completedAt.localeCompare(a[1].completedAt))
      .find(([, result]) => result.incorrectTopics.length > 0)
    const reviewId = latestIncorrect ? quizToLesson[latestIncorrect[0]] : null
    if (reviewId && !progress.completedLessons.includes(reviewId))
      return lessons.find((lesson) => lesson.id === reviewId) ?? lessons[0]
    const preferred =
      progress.level === "Avançado"
        ? "verification"
        : progress.level === "Intermediário"
          ? "prompting"
          : "generative-ai"
    return (
      lessons.find(
        (lesson) =>
          lesson.id === preferred &&
          !progress.completedLessons.includes(lesson.id),
      ) ??
      lessons.find(
        (lesson) => !progress.completedLessons.includes(lesson.id),
      ) ??
      lessons[0]
    )
  }, [progress.quizResults, progress.completedLessons, progress.level])
  const recentQuiz = Object.entries(progress.quizResults).sort((a, b) =>
    b[1].completedAt.localeCompare(a[1].completedAt),
  )[0]
  const rank = Math.floor(progress.xp / 100) + 1
  return (
    <>
      <PageTitle
        eyebrow="SEU ESPAÇO DE APRENDIZAGEM"
        title={`Olá, ${progress.profileName || "estudante"}.`}
        description="Aprenda a usar IA com intenção, repertório e responsabilidade."
        actions={
          <span className="saved-label">
            <span /> Progresso salvo neste dispositivo
          </span>
        }
      />
      {!progress.level && (
        <section className="assessment-callout">
          <span className="callout-icon">
            <Icon name="compass" size={23} />
          </span>
          <div>
            <span className="eyebrow">PERSONALIZE SEU PONTO DE PARTIDA</span>
            <h2>Faça uma avaliação rápida</h2>
            <p>Seis perguntas para identificar os temas que você já domina.</p>
          </div>
          <Button variant="secondary" onClick={onPlacement}>
            Fazer avaliação <Icon name="arrow" size={16} />
          </Button>
        </section>
      )}
      <section className="dashboard-hero">
        <div className="hero-content">
          <span className="hero-kicker">
            <Icon name="spark" size={15} /> SUA PRÓXIMA ETAPA
          </span>
          <h2>
            {canResumeLastLesson
              ? "Continue construindo seu repertório."
              : "Aprender IA começa com boas perguntas."}
          </h2>
          <p>{recommendation.description}</p>
          <div className="hero-actions">
            <Button
              onClick={() =>
                onLesson(
                  canResumeLastLesson
                    ? progress.lastLessonId!
                    : recommendation.id,
                )
              }
              icon="arrow"
            >
              {canResumeLastLesson
                ? "Retomar aprendizagem"
                : completeCount === lessons.length
                  ? "Revisar uma aula"
                  : "Começar a aprender"}
            </Button>
            <button className="hero-link" onClick={() => onPage("path")}>
              Ver trilha completa <Icon name="chevron" size={15} />
            </button>
          </div>
        </div>
        <div className="hero-progress-wrap">
          <div
            className="progress-circle"
            style={{ "--progress": `${percent * 3.6}deg` } as CSSProperties}
          >
            <div>
              <strong>
                {percent}
                <small>%</small>
              </strong>
              <span>da trilha</span>
            </div>
          </div>
          <span>
            {completeCount} de {lessons.length} módulos
          </span>
        </div>
      </section>
      <section className="stats-row" aria-label="Resumo de aprendizagem">
        <article className="stat-card">
          <span className="stat-icon indigo">
            <Icon name="book" />
          </span>
          <div>
            <span>MÓDULOS CONCLUÍDOS</span>
            <strong>
              {completeCount}
              <small> / {lessons.length}</small>
            </strong>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-icon gold">
            <Icon name="spark" />
          </span>
          <div>
            <span>EXPERIÊNCIA</span>
            <strong>
              {progress.xp}
              <small> XP · nível {rank}</small>
            </strong>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-icon green">
            <Icon name="target" />
          </span>
          <div>
            <span>AVALIAÇÕES</span>
            <strong>
              {Object.keys(progress.quizResults).length}
              <small> concluídas</small>
            </strong>
          </div>
        </article>
      </section>
      <div className="dashboard-columns">
        <section className="content-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">TRILHA RECOMENDADA</span>
              <h2>Seu próximo passo</h2>
            </div>
            <button className="text-link" onClick={() => onPage("path")}>
              Ver todos <Icon name="chevron" size={15} />
            </button>
          </div>
          <button
            className="next-lesson"
            onClick={() => onLesson(recommendation.id)}
          >
            <span className="lesson-number">
              {String(
                lessons.findIndex((item) => item.id === recommendation.id) + 1,
              ).padStart(2, "0")}
            </span>
            <span className="next-lesson-copy">
              <strong>{recommendation.title}</strong>
              <small>
                {recommendation.skill} <span>·</span> {recommendation.duration}
              </small>
            </span>
            <span className="next-arrow">
              <Icon name="arrow" size={18} />
            </span>
          </button>
          <div className="lesson-mini-list">
            {lessons.slice(0, 4).map((lesson) => (
              <div className="lesson-mini" key={lesson.id}>
                <span
                  className={`mini-status ${
                    progress.completedLessons.includes(lesson.id)
                      ? "complete"
                      : ""
                  }`}
                >
                  {progress.completedLessons.includes(lesson.id) ? (
                    <Icon name="check" size={12} />
                  ) : null}
                </span>
                <span>{lesson.title}</span>
                <small>{lesson.duration}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="content-panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">PRÁTICA</span>
              <h2>Exercite o que aprendeu</h2>
            </div>
            <Icon name="target" size={20} />
          </div>
          <p>
            Responda a situações reais e entenda o raciocínio por trás de cada
            alternativa.
          </p>
          <div className="practice-links">
            <button onClick={() => onQuiz("hallucinations")}>
              <span className="practice-index">01</span>
              <span>
                <strong>Detecte alucinações</strong>
                <small>3 questões · Pensamento crítico</small>
              </span>
              <Icon name="chevron" size={17} />
            </button>
            <button onClick={() => onQuiz("privacy")}>
              <span className="practice-index">02</span>
              <span>
                <strong>Proteja os dados</strong>
                <small>3 questões · Privacidade</small>
              </span>
              <Icon name="chevron" size={17} />
            </button>
            <button onClick={() => onPractice("compare")}>
              <span className="practice-index">03</span>
              <span>
                <strong>Compare prompts</strong>
                <small>3 desafios · +5 XP por acerto</small>
              </span>
              <Icon name="chevron" size={17} />
            </button>
            <button onClick={() => onPractice("verify")}>
              <span className="practice-index">04</span>
              <span>
                <strong>Verifique uma resposta de IA</strong>
                <small>Checklist de evidências · +3 XP por critério</small>
              </span>
              <Icon name="chevron" size={17} />
            </button>
          </div>
          {recentQuiz && (
            <div className="last-result">
              <Icon name="check" size={15} /> Último resultado:{" "}
              {recentQuiz[1].score}/{recentQuiz[1].total} em{" "}
              {quizzes[recentQuiz[0]]?.title ?? "avaliação"}
            </div>
          )}
        </section>
      </div>
      <section className="bottom-promo">
        <div>
          <span className="eyebrow">DA IDEIA AO PROJETO</span>
          <h2>O conhecimento ganha força quando vira algo seu.</h2>
          <p>
            Organize uma ideia, defina etapas e registre as decisões que você
            toma pelo caminho.
          </p>
        </div>
        <Button
          variant="secondary"
          icon="arrow"
          onClick={() => onPage("projects")}
        >
          Explorar projetos autorais
        </Button>
      </section>
    </>
  )
}

function LearningPath({
  progress,
  onLesson,
  onQuiz,
  onPractice,
}: {
  progress: Progress
  onLesson: (id: string) => void
  onQuiz: (id: string) => void
  onPractice: (kind: PracticeKind) => void
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<LearningCategory | "Todas">("Todas")
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
  const normalizedQuery = normalize(query.trim())
  const filtered = lessons.filter((lesson) => {
    const matchesCategory = category === "Todas" || lesson.category === category
    const searchable = normalize(
      `${lesson.title} ${lesson.skill} ${lesson.category} ${lesson.description}`,
    )
    return (
      matchesCategory &&
      (!normalizedQuery || searchable.includes(normalizedQuery))
    )
  })
  const groupedLessons = learningCategories
    .map((group) => ({
      category: group,
      lessons: filtered.filter((lesson) => lesson.category === group),
    }))
    .filter((group) => group.lessons.length > 0)
  const complete = progress.completedLessons.length
  return (
    <>
      <PageTitle
        eyebrow="APRENDIZAGEM APLICADA"
        title="Trilha de aprendizagem"
        description="Módulos curtos, prática guiada e espaço para formar seu próprio julgamento."
        actions={
          <div className="path-progress-label">
            <strong>
              {complete}/{lessons.length}
            </strong>
            <span>módulos concluídos</span>
          </div>
        }
      />
      <section className="path-intro">
        <div>
          <span className="eyebrow">DA COMPREENSÃO À AUTORIA</span>
          <h2>Uma base para usar IA com mais critério.</h2>
          <p>
            Explore os módulos na ordem que fizer sentido para você. As
            recomendações usam suas respostas; nenhum conteúdo essencial fica
            bloqueado.
          </p>
        </div>
        <div className="path-stages">
          <span>
            <i>01</i> Entender
          </span>
          <span>
            <i>02</i> Praticar
          </span>
          <span>
            <i>03</i> Criar
          </span>
        </div>
      </section>
      <section className="path-practice-section" aria-labelledby="path-practice-title">
        <div className="path-practice-heading">
          <div>
            <span className="eyebrow">APLIQUE O QUE APRENDEU</span>
            <h2 id="path-practice-title">Práticas guiadas</h2>
          </div>
          <span>Os acertos contam para suas missões e conquistas.</span>
        </div>
        <div className="path-practice-grid">
          <button className="path-practice-card" onClick={() => onPractice("compare")} type="button">
            <span className="path-practice-icon purple"><Icon name="spark" size={19} /></span>
            <span className="path-practice-copy">
              <strong>Comparação de prompts</strong>
              <small>3 objetivos, 3 pares de prompts e feedback explicativo.</small>
            </span>
            <span className="path-practice-reward">Até 15 XP <Icon name="arrow" size={15} /></span>
          </button>
          <button className="path-practice-card" onClick={() => onPractice("verify")} type="button">
            <span className="path-practice-icon gold"><Icon name="shield" size={19} /></span>
            <span className="path-practice-copy">
              <strong>Verificação de informações</strong>
              <small>Confira fonte, data, cálculo e consistência da afirmação.</small>
            </span>
            <span className="path-practice-reward">Até 12 XP <Icon name="arrow" size={15} /></span>
          </button>
        </div>
      </section>
      <div className="path-toolbar">
        <div>
          <h2>Todos os módulos</h2>
          <span>{filtered.length} conteúdos</span>
        </div>
        <label className="search-box">
          <Icon name="search" size={17} />
          <input
            aria-label="Buscar módulos"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por tema"
            value={query}
          />
        </label>
        <label className="category-filter">
          <span>Categoria</span>
          <select
            aria-label="Filtrar módulos por categoria"
            onChange={(event) =>
              setCategory(event.target.value as LearningCategory | "Todas")
            }
            value={category}
          >
            <option value="Todas">Todas</option>
            {learningCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      {groupedLessons.map((group) => (
        <section className="module-group" key={group.category}>
          <header className="module-group-heading">
            <h3>{group.category}</h3>
            <span>
              {group.lessons.length}{" "}
              {group.lessons.length === 1 ? "módulo" : "módulos"}
            </span>
          </header>
          <div className="module-grid">
            {group.lessons.map((lesson) => {
              const done = progress.completedLessons.includes(lesson.id)
              return (
                <article
                  className={`module-card ${done ? "module-done" : ""}`}
                  key={lesson.id}
                >
                  <div className="module-card-top">
                    <span className="module-index">
                      MÓDULO {String(lesson.number).padStart(2, "0")}
                    </span>
                    <span
                      className={`skill-chip ${
                        lesson.skill === "Privacidade"
                          ? "chip-green"
                          : lesson.skill === "Prompting"
                            ? "chip-purple"
                            : ""
                      }`}
                    >
                      {lesson.skill}
                    </span>
                  </div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                  <div className="module-meta">
                    <span>
                      <Icon name="clock" size={14} /> {lesson.duration}
                    </span>
                    <span>
                      {done ? (
                        <>
                          <Icon name="check" size={14} /> Concluído
                        </>
                      ) : (
                        "Aula + prática"
                      )}
                    </span>
                  </div>
                  <div className="module-actions">
                    <Button
                      variant={done ? "secondary" : "brand"}
                      onClick={() => onLesson(lesson.id)}
                    >
                      {done ? "Revisar aula" : "Estudar módulo"}{" "}
                      <Icon name="arrow" size={15} />
                    </Button>
                    <button
                      className="icon-text-button"
                      onClick={() => onQuiz(lesson.quizId)}
                    >
                      Praticar <Icon name="chevron" size={14} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
      {filtered.length === 0 && (
        <EmptyState
          icon="search"
          title="Nenhum módulo encontrado"
          description="Tente outro tema ou remova parte da busca."
        />
      )}
    </>
  )
}

function LessonView({
  lesson,
  completed,
  reflection,
  onReflection,
  onBack,
  onComplete,
  onQuiz,
  onStudio,
  onProjects,
}: {
  lesson: Lesson
  completed: boolean
  reflection: string
  onReflection: (value: string) => void
  onBack: () => void
  onComplete: () => void
  onQuiz: (id: string) => void
  onStudio: () => void
  onProjects: () => void
}) {
  function setReflection(value: string) {
    onReflection(value)
  }
  return (
    <div className="lesson-view">
      <button className="text-action" onClick={onBack}>
        <Icon name="chevron" size={16} /> Voltar à trilha
      </button>
      <div className="lesson-layout">
        <aside className="lesson-aside">
          <span className="eyebrow">OBJETIVO DE APRENDIZAGEM</span>
          <p>{lesson.objective}</p>
          <div className="lesson-aside-meta">
            <span>
              <Icon name="clock" size={15} /> {lesson.duration}
            </span>
            <span>
              <Icon name="layers" size={15} /> {lesson.skill}
            </span>
          </div>
          <div className="lesson-aside-callout">
            <Icon name="light" size={17} />
            <span>
              Aprenda um conceito. Teste uma ideia. Revise com seu próprio
              critério.
            </span>
          </div>
        </aside>
        <article className="lesson-article">
          <span className="eyebrow">
            MÓDULO {String(lesson.number).padStart(2, "0")} ·{" "}
            {lesson.category.toUpperCase()}
          </span>
          <h1>{lesson.title}</h1>
          <p className="lesson-lead">{lesson.description}</p>
          {lesson.objectives && (
            <section
              className="lesson-objectives"
              aria-label="Objetivos desta aula"
            >
              <h2>Ao final, você poderá</h2>
              <ul>
                {lesson.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            </section>
          )}
          {lesson.sections.map((section, index) => (
            <section className="lesson-section" key={section.title}>
              <span className="section-index">0{index + 1}</span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </div>
            </section>
          ))}
          {lesson.examples && (
            <section className="lesson-examples">
              <span className="eyebrow">EXEMPLOS PROFISSIONAIS</span>
              {lesson.examples.map((example) => (
                <article className="lesson-example" key={example.title}>
                  <h2>{example.title}</h2>
                  <p>{example.prompt}</p>
                  <small>
                    <strong>Revise:</strong> {example.review}
                  </small>
                </article>
              ))}
            </section>
          )}
          {lesson.demonstration && (
            <section className="lesson-demonstration">
              <span className="eyebrow">DEMONSTRAÇÃO GUIADA</span>
              <div>
                <h2>Pedido inicial</h2>
                <p>{lesson.demonstration.startingPrompt}</p>
              </div>
              <div>
                <h2>Versão estruturada</h2>
                <p>{lesson.demonstration.structuredPrompt}</p>
              </div>
              <small>{lesson.demonstration.analysis}</small>
            </section>
          )}
          <section className="practice-box">
            <span className="eyebrow">AGORA É COM VOCÊ</span>
            <h2>Uma pequena prática</h2>
            <p>{lesson.practice}</p>
            {(lesson.id === "prompting" ||
              lesson.id === "advanced-prompting") && (
              <Button variant="secondary" onClick={onStudio}>
                Abrir construtor de prompts <Icon name="arrow" size={15} />
              </Button>
            )}
            {lesson.id === "integrative-project" && (
              <Button variant="secondary" onClick={onProjects}>
                Abrir laboratório de projetos <Icon name="arrow" size={15} />
              </Button>
            )}
            <label htmlFor="reflection">
              Registre sua entrega ou reflexão{" "}
              <span>Opcional · fica salva neste navegador</span>
            </label>
            <textarea
              id="reflection"
              onChange={(event) => setReflection(event.target.value)}
              placeholder="O que você percebeu? O que quer testar?"
              rows={3}
              value={reflection}
            />
          </section>
          {lesson.challenge && (
            <section className="lesson-challenge">
              <span className="eyebrow">DESAFIO DE ENTREGA</span>
              <p>{lesson.challenge}</p>
            </section>
          )}
          {lesson.checklist && (
            <section className="lesson-checklist">
              <h2>Checklist de revisão</h2>
              <ul>
                {lesson.checklist.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={15} /> {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {lesson.nextCapability && (
            <aside className="lesson-next">
              <strong>Próxima capacidade</strong>
              <p>{lesson.nextCapability}</p>
            </aside>
          )}
          {lesson.references && (
            <section className="lesson-references">
              <h2>Leituras para aprofundar</h2>
              {lesson.references.map((reference) => (
                <a
                  href={reference.url}
                  key={reference.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {reference.label} <Icon name="arrow" size={13} />
                </a>
              ))}
            </section>
          )}
          <div className="lesson-bottom-actions">
            <Button variant="secondary" onClick={() => onQuiz(lesson.quizId)}>
              Fazer atividade <Icon name="arrow" size={15} />
            </Button>
            <Button
              onClick={onComplete}
              disabled={completed}
              icon={completed ? "check" : "check"}
            >
              {completed ? "Módulo concluído" : "Concluir módulo · +25 XP"}
            </Button>
          </div>
        </article>
      </div>
    </div>
  )
}

function QuizView({
  quiz,
  onComplete,
  onBack,
}: {
  quiz: QuizContent
  onComplete: (result: {
    score: number
    total: number
    incorrectTopics: string[]
  }) => void
  onBack: () => void
}) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [incorrectTopics, setIncorrectTopics] = useState<string[]>([])
  const [finished, setFinished] = useState(false)
  const question = quiz.questions[current]
  if (finished) {
    const percentage = Math.round((score / quiz.questions.length) * 100)
    return (
      <main className="focus-view">
        <div className="quiz-result">
          <button className="text-action" onClick={onBack}>
            <Icon name="chevron" size={16} /> Voltar
          </button>
          <span className="result-mark">
            <Icon name={percentage >= 80 ? "award" : "book"} size={28} />
          </span>
          <span className="eyebrow">PRÁTICA CONCLUÍDA</span>
          <h1>
            {percentage >= 80
              ? "Boa leitura crítica."
              : "Você já tem um próximo passo."}
          </h1>
          <p>
            Você acertou{" "}
            <strong>
              {score} de {quiz.questions.length}
            </strong>{" "}
            questões ({percentage}%). Reveja cada explicação e use o resultado
            para escolher o que praticar.
          </p>
          <div className="score-track">
            <span style={{ width: `${percentage}%` }} />
          </div>
          {incorrectTopics.length > 0 ? (
            <div className="review-topics">
              <strong>Temas para revisitar</strong>
              <div>
                {[...new Set(incorrectTopics)].map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="review-success">
              <Icon name="check" size={16} /> Todas as respostas corretas nesta
              tentativa.
            </div>
          )}
          <Button onClick={onBack} icon="arrow">
            Voltar à aprendizagem
          </Button>
        </div>
      </main>
    )
  }
  function verify() {
    if (selected === null || checked) return
    setChecked(true)
    if (selected === question.answer) setScore((value) => value + 1)
    else setIncorrectTopics((topics) => [...topics, question.topic])
  }
  function next() {
    if (!checked) return
    if (current === quiz.questions.length - 1) {
      setFinished(true)
      onComplete({ score, total: quiz.questions.length, incorrectTopics })
    } else {
      setCurrent((value) => value + 1)
      setSelected(null)
      setChecked(false)
    }
  }
  return (
    <main className="focus-view">
      <div className="quiz-card">
        <div className="quiz-card-head">
          <button className="text-action" onClick={onBack}>
            <Icon name="chevron" size={16} /> Voltar
          </button>
          <span>
            {current + 1} <small>/ {quiz.questions.length}</small>
          </span>
        </div>
        <div className="progress-track">
          <span
            style={{
              width: `${((current + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
        <span className="eyebrow">PRÁTICA INTERATIVA</span>
        <h1>{quiz.title}</h1>
        <p className="quiz-description">{quiz.description}</p>
        <div className="quiz-question">
          <span className="question-topic">{question.topic}</span>
          <h2>{question.prompt}</h2>
          <div className="answer-options">
            {question.options.map((option, index) => (
              <button
                key={option}
                className={`answer-option ${
                  selected === index ? "selected" : ""
                } ${
                  checked && index === question.answer ? "answer-correct" : ""
                } ${
                  checked && selected === index && selected !== question.answer
                    ? "answer-wrong"
                    : ""
                }`}
                onClick={() => !checked && setSelected(index)}
                aria-pressed={selected === index}
                disabled={checked}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
                <span className="option-radio">
                  {checked && index === question.answer ? (
                    <Icon name="check" size={14} />
                  ) : null}
                </span>
              </button>
            ))}
          </div>
          {checked && (
            <div
              className={`answer-feedback ${
                selected === question.answer
                  ? "feedback-correct"
                  : "feedback-wrong"
              }`}
              role="status"
            >
              <strong>
                <Icon
                  name={selected === question.answer ? "check" : "light"}
                  size={16}
                />
                {selected === question.answer
                  ? "Resposta correta"
                  : "Vamos entender melhor"}
              </strong>
              <p>{question.explanations[selected ?? 0]}</p>
            </div>
          )}
        </div>
        <div className="quiz-footer">
          <span>
            {checked
              ? `${score} acerto${score === 1 ? "" : "s"} até aqui`
              : "O feedback aparece após conferir."}
          </span>
          {checked ? (
            <Button icon="arrow" onClick={next}>
              {current === quiz.questions.length - 1
                ? "Ver resultado"
                : "Continuar"}
            </Button>
          ) : (
            <Button onClick={verify} disabled={selected === null}>
              Conferir resposta
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}

function PromptStudio({
  progress,
  onDraft,
  onNotify,
}: {
  progress: Progress
  onDraft: (draft: Progress["promptDraft"]) => void
  onNotify: (message: string) => void
}) {
  const draft = progress.promptDraft
  const [copied, setCopied] = useState(false)
  function update(field: keyof typeof draft, value: string) {
    onDraft({ ...draft, [field]: value })
  }
  function generate() {
    if (!draft.goal.trim()) {
      onNotify("Preencha o objetivo antes de montar o prompt.")
      return
    }
    const parts = [
      "Ajude-me com a tarefa a seguir. Use as informações fornecidas e sinalize dúvidas em vez de presumir fatos.",
      draft.context.trim() && `CONTEXTO\n${draft.context.trim()}`,
      `OBJETIVO\n${draft.goal.trim()}`,
      draft.audience.trim() && `PÚBLICO\n${draft.audience.trim()}`,
      draft.inputs.trim() && `INFORMAÇÕES DISPONÍVEIS\n${draft.inputs.trim()}`,
      draft.format.trim() && `FORMATO DE SAÍDA\n${draft.format.trim()}`,
      draft.constraints.trim() &&
        `RESTRIÇÕES E CRITÉRIOS\n${draft.constraints.trim()}`,
      "Se faltarem informações essenciais, faça perguntas. Separe fatos de suposições e não invente fontes.",
    ]
      .filter(Boolean)
      .join("\n\n")
    onDraft({ ...draft, result: parts })
    onNotify("Prompt montado com os campos que você preencheu.")
  }
  async function copyResult() {
    if (!draft.result) return
    try {
      await navigator.clipboard.writeText(draft.result)
      setCopied(true)
      onNotify("Prompt copiado.")
    } catch {
      setCopied(false)
      onNotify(
        "A área de transferência não está disponível. Selecione e copie o texto manualmente.",
      )
    }
  }
  const fields: {
    key: keyof Omit<typeof draft, "result">
    label: string
    hint: string
    placeholder: string
  }[] = [
    {
      key: "context",
      label: "Contexto",
      hint: "O que está acontecendo?",
      placeholder:
        "Ex.: Estou preparando uma apresentação para uma disciplina…",
    },
    {
      key: "goal",
      label: "Objetivo",
      hint: "O que você precisa alcançar?",
      placeholder: "Ex.: Organizar os tópicos e sugerir uma sequência clara…",
    },
    {
      key: "audience",
      label: "Público",
      hint: "Para quem é o resultado?",
      placeholder: "Ex.: Estudantes do primeiro semestre…",
    },
    {
      key: "inputs",
      label: "Informações disponíveis",
      hint: "O que a ferramenta pode considerar?",
      placeholder: "Ex.: Estes são meus tópicos: …",
    },
    {
      key: "format",
      label: "Formato de saída",
      hint: "Como deve ser apresentado?",
      placeholder:
        "Ex.: Um roteiro de 6 slides com títulos e pontos principais…",
    },
    {
      key: "constraints",
      label: "Restrições e critérios",
      hint: "O que deve ser respeitado?",
      placeholder:
        "Ex.: Use linguagem direta, sinalize dúvidas e não invente referências…",
    },
  ]
  return (
    <>
      <PageTitle
        eyebrow="FERRAMENTA DE APRENDIZAGEM"
        title="Construtor de prompts"
        description="Dê forma à sua ideia. O resultado é montado localmente a partir do que você escrever; nenhuma IA externa é chamada."
        actions={
          <span className="saved-label">
            <span /> Rascunho salvo
          </span>
        }
      />
      <div className="studio-grid">
        <section className="studio-form-panel">
          <div className="studio-panel-heading">
            <span className="step-circle">1</span>
            <div>
              <h2>Construa sua instrução</h2>
              <p>Você pode começar com poucos campos e refinar depois.</p>
            </div>
          </div>
          <div className="prompt-fields">
            {fields.map((field, index) => (
              <label
                className="prompt-field"
                htmlFor={`prompt-${field.key}`}
                key={field.key}
              >
                <span className="field-heading">
                  <strong>
                    <i>{String(index + 1).padStart(2, "0")}</i>
                    {field.label}
                  </strong>
                  <small>{field.hint}</small>
                </span>
                <textarea
                  id={`prompt-${field.key}`}
                  onChange={(event) => update(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  rows={index === 0 || index === 3 ? 3 : 2}
                  value={draft[field.key]}
                />
              </label>
            ))}
          </div>
          <Button className="full-button" icon="spark" onClick={generate}>
            Montar meu prompt
          </Button>
        </section>
        <aside className="studio-output">
          <div className="studio-panel-heading">
            <span className="step-circle step-output">2</span>
            <div>
              <h2>Seu prompt estruturado</h2>
              <p>Revise e edite o texto antes de reutilizar.</p>
            </div>
          </div>
          {draft.result ? (
            <>
              <textarea
                className="generated-prompt"
                aria-label="Prompt estruturado editável"
                onChange={(event) => update("result", event.target.value)}
                rows={16}
                value={draft.result}
              />
              <div className="output-actions">
                <Button variant="secondary" icon="copy" onClick={copyResult}>
                  {copied ? "Copiado" : "Copiar prompt"}
                </Button>
                <span>Seu texto permanece neste navegador.</span>
              </div>
            </>
          ) : (
            <div className="output-placeholder">
              <span>
                <Icon name="spark" size={24} />
              </span>
              <strong>Seu prompt aparece aqui</strong>
              <p>
                Preencha o objetivo e monte uma primeira versão para revisar.
              </p>
            </div>
          )}
          <div className="prompt-tip">
            <Icon name="light" size={17} />
            <p>
              <strong>Uma boa instrução pode iterar.</strong> Compare o
              resultado com seu objetivo, acrescente contexto útil e peça
              esclarecimentos quando necessário.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}

function ProjectLab({
  progress,
  onCreate,
  onStep,
  onProjectUpdate,
}: {
  progress: Progress
  onCreate: (input: CreateProjectInput) => void
  onStep: (projectId: string, stepId: string, complete: boolean) => void
  onProjectUpdate: (projectId: string, notes: string) => void
}) {
  const [title, setTitle] = useState("")
  const [idea, setIdea] = useState("")
  const [objective, setObjective] = useState("")
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim() || !idea.trim() || !objective.trim()) return
    onCreate({
      title: title.trim(),
      idea: idea.trim(),
      objective: objective.trim(),
    })
    setTitle("")
    setIdea("")
    setObjective("")
  }
  return (
    <>
      <PageTitle
        eyebrow="DA IDEIA À REALIZAÇÃO"
        title="Laboratório de projetos"
        description="Organize um projeto que tenha significado para você, com a IA como apoio e as decisões permanecendo suas."
        actions={
          <span className="privacy-tag">
            <Icon name="lock" size={14} /> Projetos salvos só neste navegador
          </span>
        }
      />
      <section className="project-intro">
        <div className="project-intro-mark">
          <Icon name="light" size={27} />
        </div>
        <div>
          <span className="eyebrow">AUTORIA EM PRIMEIRO LUGAR</span>
          <h2>Um espaço para pensar, testar e construir.</h2>
          <p>
            Registre sua ideia, avance por etapas e documente as decisões. O
            guia e as sugestões são regras locais; não há geração automática por
            IA.
          </p>
        </div>
      </section>
      <div className="project-columns">
        <form className="project-create-panel" onSubmit={submit}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">NOVO PROJETO</span>
              <h2>Comece com uma ideia</h2>
            </div>
            <span className="create-icon">
              <Icon name="plus" size={17} />
            </span>
          </div>
          <label htmlFor="project-title">Nome do projeto</label>
          <input
            id="project-title"
            maxLength={90}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Guia de boas-vindas do campus"
            required
            value={title}
          />
          <label htmlFor="project-idea">Qual é a ideia?</label>
          <textarea
            id="project-idea"
            onChange={(event) => setIdea(event.target.value)}
            placeholder="Que problema ou oportunidade chamou sua atenção?"
            required
            rows={3}
            value={idea}
          />
          <label htmlFor="project-goal">O que você quer realizar?</label>
          <textarea
            id="project-goal"
            onChange={(event) => setObjective(event.target.value)}
            placeholder="Como seria um resultado útil para você ou para outras pessoas?"
            required
            rows={3}
            value={objective}
          />
          <div className="privacy-hint">
            <Icon name="shield" size={16} />
            <span>
              Evite inserir dados pessoais, informações confidenciais ou
              conteúdo de terceiros sem autorização.
            </span>
          </div>
          <Button className="full-button" icon="plus" type="submit">
            Criar projeto
          </Button>
          <small className="xp-note">
            Seu primeiro projeto completo rende 15 XP. Cada etapa concluída
            rende 10 XP, uma vez.
          </small>
        </form>
        <section className="projects-list">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">SEU ESPAÇO DE CRIAÇÃO</span>
              <h2>
                {progress.projects.length
                  ? `${progress.projects.length} projeto${
                      progress.projects.length === 1 ? "" : "s"
                    }`
                  : "Seus projetos"}
              </h2>
            </div>
          </div>
          {progress.projects.length === 0 ? (
            <EmptyState
              icon="light"
              title="Sua próxima ideia começa aqui"
              description="Crie um projeto e use o roteiro para transformar intenção em etapas concretas."
            />
          ) : (
            progress.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onStep={onStep}
                onProjectUpdate={onProjectUpdate}
              />
            ))
          )}
        </section>
      </div>
    </>
  )
}

function ProjectCard({
  project,
  onStep,
  onProjectUpdate,
}: {
  project: Project
  onStep: (projectId: string, stepId: string, complete: boolean) => void
  onProjectUpdate: (projectId: string, notes: string) => void
}) {
  const complete = project.steps.filter((step) => step.complete).length
  const missing: string[] = []
  if (project.title.trim().length < 5) missing.push("deixe o título específico")
  if (project.idea.trim().length < 30) missing.push("adicione contexto à ideia")
  if (project.objective.trim().length < 20)
    missing.push("defina como reconhecer um resultado útil")
  return (
    <article className="project-card">
      <div className="project-card-heading">
        <span className="project-icon">
          <Icon name="light" size={19} />
        </span>
        <div>
          <h3>{project.title}</h3>
          <p>
            Criado em{" "}
            {new Date(project.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="project-percent">
          {Math.round((complete / project.steps.length) * 100)}%
        </span>
      </div>
      <div className="project-description">
        <span>
          <strong>IDEIA</strong>
          {project.idea}
        </span>
        <span>
          <strong>OBJETIVO</strong>
          {project.objective}
        </span>
      </div>
      <div className="project-progress-track">
        <span
          style={{ width: `${(complete / project.steps.length) * 100}%` }}
        />
      </div>
      <span className="eyebrow project-steps-label">
        ROTEIRO DE DESENVOLVIMENTO
      </span>
      <div className="project-steps">
        {project.steps.map((step, index) => (
          <label
            className={`project-step ${step.complete ? "step-complete" : ""}`}
            key={step.id}
          >
            <input
              checked={step.complete}
              onChange={(event) =>
                onStep(project.id, step.id, event.target.checked)
              }
              type="checkbox"
            />
            <span className="step-count">0{index + 1}</span>
            <span className="step-copy">
              <strong>{step.title}</strong>
              <small>{step.guide}</small>
            </span>
            <span className="step-checkbox">
              {step.complete && <Icon name="check" size={13} />}
            </span>
          </label>
        ))}
      </div>
      <label className="project-notes" htmlFor={`notes-${project.id}`}>
        Decisões e aprendizados
        <textarea
          id={`notes-${project.id}`}
          onChange={(event) => onProjectUpdate(project.id, event.target.value)}
          placeholder="Registre o que você decidiu, verificou ou aprendeu..."
          rows={3}
          value={project.notes}
        />
      </label>
      <div className="project-review">
        <Icon name="spark" size={16} />
        <span>
          <strong>Revisão guiada, sem IA externa</strong>
          {missing.length
            ? ` Para fortalecer este projeto, ${missing.join(" e ")}.`
            : " Sua ideia já tem contexto e objetivo. Continue avançando no roteiro e revise as evidências."}
        </span>
      </div>
    </article>
  )
}

function Journey({
  progress,
  onPage,
  onPractice,
}: {
  progress: Progress
  onPage: (page: Page) => void
  onPractice: (kind: PracticeKind) => void
}) {
  const rank = Math.floor(progress.xp / 100) + 1
  const xpToNext = 100 - (progress.xp % 100)
  const comparisonsThisWeek = promptComparisonExercises.filter((exercise) =>
    completedThisWeek(progress.practiceResults[exercise.id]),
  ).length
  const verificationThisWeek = completedThisWeek(
    progress.practiceResults[verificationExercise.id],
  )
  const comparisonBadgeUnlocked = promptComparisonExercises.every((exercise) =>
    progress.rewardClaims.includes(`practice:${exercise.id}:answer`),
  )
  const verificationResult = progress.practiceResults[verificationExercise.id]
  const badges = [
    {
      id: "first-lesson",
      title: "Primeiro passo",
      description: "Conclua seu primeiro módulo",
      icon: "book" as IconName,
      unlocked: progress.completedLessons.length > 0,
    },
    {
      id: "critical-reader",
      title: "Olhar crítico",
      description: "Conclua o desafio de alucinações",
      icon: "search" as IconName,
      unlocked: Boolean(progress.quizResults.hallucinations),
    },
    {
      id: "privacy-guardian",
      title: "Cuidado com dados",
      description: "Conclua o desafio de privacidade",
      icon: "shield" as IconName,
      unlocked: Boolean(progress.quizResults.privacy),
    },
    {
      id: "prompt-builder",
      title: "Arquiteto de prompts",
      description: "Monte um prompt estruturado",
      icon: "spark" as IconName,
      unlocked: Boolean(progress.promptDraft.result),
    },
    {
      id: "author",
      title: "Projeto autoral",
      description: "Crie seu primeiro projeto",
      icon: "light" as IconName,
      unlocked: progress.projects.length > 0,
    },
    {
      id: "fact-checker",
      title: "Verificador atento",
      description: "Conclua a prática de verificação",
      icon: "check" as IconName,
      unlocked: Boolean(
        progress.quizResults.verification ||
          (verificationResult && verificationResult.score >= 3),
      ),
    },
    {
      id: "prompt-comparator",
      title: "Olhar comparativo",
      description: "Acerte os três desafios de comparação",
      icon: "spark" as IconName,
      unlocked: comparisonBadgeUnlocked,
    },
  ]
  const missions = [
    {
      title: "Complete um módulo",
      done: progress.completedLessons.length > 0,
      action: () => onPage("path"),
    },
    {
      title: "Pratique a leitura crítica",
      done: Boolean(progress.quizResults.hallucinations),
      action: () => onPage("dashboard"),
    },
    {
      title: "Estruture um prompt útil",
      done: Boolean(progress.promptDraft.result),
      action: () => onPage("studio"),
    },
    {
      title: "Leve uma ideia ao laboratório",
      done: progress.projects.length > 0,
      action: () => onPage("projects"),
    },
  ]
  return (
    <>
      <PageTitle
        eyebrow="PROGRESSO COM PROPÓSITO"
        title="Sua jornada"
        description="Pontos e reconhecimentos ligados a práticas concretas de aprendizagem."
      />
      <section className="journey-hero">
        <div className="journey-level">
          <span className="level-seal">
            <Icon name="award" size={24} />
          </span>
          <div>
            <span className="eyebrow eyebrow-light">NÍVEL ATUAL</span>
            <h2>Nível {rank}</h2>
            <p>
              {progress.level
                ? `Trilha sugerida: ${progress.level}`
                : "Faça o nivelamento para escolher seu ponto de partida."}
            </p>
          </div>
        </div>
        <div className="xp-summary">
          <strong>
            {progress.xp}
            <small> XP</small>
          </strong>
          <span>{xpToNext} XP para o próximo nível</span>
          <div className="xp-progress">
            <span style={{ width: `${progress.xp % 100}%` }} />
          </div>
        </div>
      </section>
      <section className="weekly-missions content-panel" aria-labelledby="weekly-missions-title">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">MISSÕES SEMANAIS</span>
            <h2 id="weekly-missions-title">Pratique e avance nesta semana</h2>
          </div>
          <span className="weekly-reset-note">Renovam na segunda-feira</span>
        </div>
        <div className="weekly-mission-grid">
          <button className="weekly-mission-card" onClick={() => onPractice("compare")} type="button">
            <span className="weekly-mission-top"><span className="weekly-mission-icon"><Icon name="spark" size={16} /></span><span>{comparisonsThisWeek}/3 desafios</span></span>
            <strong>Compare três pares de prompts</strong>
            <small>Ganhe XP pelos acertos. Repetições ajudam a revisar, sem duplicar XP.</small>
            <span aria-label={`${comparisonsThisWeek} de 3 desafios concluídos nesta semana`} aria-valuemax={3} aria-valuemin={0} aria-valuenow={comparisonsThisWeek} className="weekly-progress" role="progressbar"><i style={{ width: `${(comparisonsThisWeek / 3) * 100}%` }} /></span>
          </button>
          <button className="weekly-mission-card" onClick={() => onPractice("verify")} type="button">
            <span className="weekly-mission-top"><span className="weekly-mission-icon gold"><Icon name="shield" size={16} /></span><span>{verificationThisWeek ? "Concluída" : "0/1 atividade"}</span></span>
            <strong>Verifique uma resposta de IA</strong>
            <small>Confira evidência e consistência; acerte 3 de 4 critérios para a conquista.</small>
            <span aria-label={verificationThisWeek ? "Atividade concluída nesta semana" : "Atividade pendente nesta semana"} aria-valuemax={1} aria-valuemin={0} aria-valuenow={verificationThisWeek ? 1 : 0} className="weekly-progress" role="progressbar"><i style={{ width: verificationThisWeek ? "100%" : "0%" }} /></span>
          </button>
        </div>
      </section>
      <div className="journey-columns">
        <section className="content-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">PRÓXIMAS AÇÕES</span>
              <h2>Missões de aprendizagem</h2>
            </div>
          </div>
          <div className="missions-list">
            {missions.map((mission, index) => (
              <button
                key={mission.title}
                className="mission-row"
                onClick={mission.action}
              >
                <span
                  className={`mission-check ${
                    mission.done ? "mission-done" : ""
                  }`}
                >
                  {mission.done && <Icon name="check" size={13} />}
                </span>
                <span>
                  <strong>{mission.title}</strong>
                  <small>
                    {mission.done ? "Concluída" : "Continue seu percurso"}
                  </small>
                </span>
                <span className="mission-number">0{index + 1}</span>
              </button>
            ))}
          </div>
          <p className="reward-rule">
            <Icon name="shield" size={15} /> XP é concedido uma vez por
            atividade concluída; refazer não duplica pontos.
          </p>
        </section>
        <section className="content-panel badge-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">RECONHECIMENTOS</span>
              <h2>Conquistas</h2>
            </div>
            <span>
              {badges.filter((badge) => badge.unlocked).length}/{badges.length}
            </span>
          </div>
          <div className="badge-grid">
            {badges.map((badge) => (
              <div
                className={`badge-item ${
                  badge.unlocked ? "badge-unlocked" : ""
                }`}
                key={badge.id}
              >
                <span>
                  <Icon name={badge.icon} size={18} />
                </span>
                <strong>{badge.title}</strong>
                <small>{badge.description}</small>
                <i>{badge.unlocked ? "Conquistada" : "A desenvolver"}</i>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function PlusPage() {
  return (
    <>
      <PageTitle
        eyebrow="PLANOS LEARN AI"
        title="Aprender deve continuar acessível."
        description="A proposta freemium mantém os fundamentos essenciais gratuitos e reserva apoio avançado para quem precisa."
      />
      <section className="plans-grid">
        <article className="plan-card plan-free">
          <span className="eyebrow">COMEÇAR</span>
          <h2>Gratuito</h2>
          <p>
            Aprenda fundamentos, pratique e acompanhe seu próprio progresso.
          </p>
          <ul>
            <li>
              <Icon name="check" size={16} /> Todos os módulos essenciais
            </li>
            <li>
              <Icon name="check" size={16} /> Quizzes e feedback explicativo
            </li>
            <li>
              <Icon name="check" size={16} /> Construtor local de prompts
            </li>
            <li>
              <Icon name="check" size={16} /> Projetos autorais no navegador
            </li>
          </ul>
          <span className="plan-current">
            <Icon name="check" size={15} /> Disponível nesta demonstração
          </span>
        </article>
        <article className="plan-card plan-plus">
          <span className="plan-plus-icon">
            <Icon name="spark" size={19} />
          </span>
          <span className="eyebrow">PARA IR MAIS LONGE</span>
          <h2>Learn AI Plus</h2>
          <p>
            Uma hipótese de plano para recursos avançados de apoio à criação,
            organização e revisão.
          </p>
          <ul>
            <li>
              <Icon name="check" size={16} /> Exploração assistida de ideias
            </li>
            <li>
              <Icon name="check" size={16} /> Revisão orientada de projetos
            </li>
            <li>
              <Icon name="check" size={16} /> Modelos extras para o laboratório
            </li>
            <li>
              <Icon name="check" size={16} /> Visibilidade de uso de recursos de
              IA
            </li>
          </ul>
          <button className="integration-notice" disabled>
            <Icon name="lock" size={16} />
            <span>
              <strong>Integração ainda não configurada</strong>
              <small>
                Não há preço, assinatura ativa ou cobrança neste protótipo.
              </small>
            </span>
          </button>
        </article>
      </section>
      <div className="plan-footnote">
        <Icon name="shield" size={16} />
        <span>
          Os recursos pagos ainda são uma hipótese de produto. Nenhum benefício,
          preço ou pagamento foi ativado.
        </span>
      </div>
    </>
  )
}

function Profile({
  progress,
  onSave,
  onClear,
  onPlacement,
  onSignOut,
}: {
  progress: Progress
  onSave: (name: string) => void
  onClear: () => void
  onPlacement: () => void
  onSignOut: () => void
}) {
  const [name, setName] = useState(progress.profileName)
  function submit(event: FormEvent) {
    event.preventDefault()
    if (name.trim()) onSave(name.trim().slice(0, 60))
  }
  return (
    <>
      <PageTitle
        eyebrow="PREFERÊNCIAS"
        title="Seu perfil local"
        description="Este espaço existe neste navegador e não representa uma conta autenticada."
      />
      <div className="profile-grid">
        <section className="content-panel profile-panel">
          <span className="profile-avatar">
            {progress.profileName.slice(0, 1).toUpperCase() || "L"}
          </span>
          <span className="eyebrow">PERFIL NESTE DISPOSITIVO</span>
          <h2>{progress.profileName || "Estudante"}</h2>
          <p>
            Seu percurso e os projetos criados ficam armazenados localmente
            neste navegador.
          </p>
          <form onSubmit={submit}>
            <label htmlFor="profile-name">Nome de exibição</label>
            <div className="inline-field">
              <input
                id="profile-name"
                maxLength={60}
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
              <Button variant="secondary" type="submit">
                Salvar nome
              </Button>
            </div>
          </form>
          <div className="profile-details">
            <span>
              <strong>Nível sugerido</strong>
              {progress.level ?? "Ainda não definido"}
            </span>
            <span>
              <strong>Experiência</strong>
              {progress.xp} XP
            </span>
            <span>
              <strong>Módulos concluídos</strong>
              {progress.completedLessons.length} de {lessons.length}
            </span>
            <span>
              <strong>Projetos locais</strong>
              {progress.projects.length}
            </span>
          </div>
          <div className="profile-actions">
            <Button variant="secondary" onClick={onPlacement}>
              Refazer nivelamento
            </Button>
            <Button variant="secondary" onClick={onSignOut}>
              Sair do perfil neste dispositivo
            </Button>
          </div>
        </section>
        <aside className="content-panel privacy-panel">
          <span className="privacy-panel-icon">
            <Icon name="lock" size={20} />
          </span>
          <h2>Seus dados e este protótipo</h2>
          <p>
            Progresso, respostas e rascunhos ficam no armazenamento local do
            navegador. Eles não são enviados para uma conta, serviço de IA ou
            servidor de aprendizagem.
          </p>
          <p>
            Limpar os dados remove definitivamente este perfil e seu progresso
            deste navegador.
          </p>
          <Button className="clear-button" variant="danger" onClick={onClear}>
            Limpar dados locais
          </Button>
          <small>
            Não há recuperação ou sincronização em outro dispositivo.
          </small>
        </aside>
      </div>
    </>
  )
}

function App() {
  const [progress, setProgress] = useState<Progress>(() => readProgress())
  const [theme, setTheme] = useState<Theme>(() => readTheme())
  const [isSignedOut, setIsSignedOut] = useState(() => readLocalSignOut())
  const [page, setPage] = useState<Page>(() =>
    progress.profileName && !isSignedOut ? "dashboard" : "welcome",
  )
  const [activeLessonId, setActiveLessonId] = useState(
    () => progress.lastLessonId ?? lessons[0].id,
  )
  const [activeQuizId, setActiveQuizId] = useState("hallucinations")
  const [toast, setToast] = useState("")
  const [storageWarning, setStorageWarning] = useState(false)

  useEffect(() => {
    setStorageWarning(!saveProgress(progress))
  }, [progress])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem(themeStorageKey, theme)
    } catch {
      /* O tema segue aplicado nesta sessão mesmo se o navegador bloquear armazenamento. */
    }
  }, [theme])

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"))
  }

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(""), 3200)
  }
  function navigate(next: Page) {
    setPage(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  function openLesson(id: string) {
    setActiveLessonId(id)
    setProgress((current) => ({ ...current, lastLessonId: id }))
    navigate("lesson")
  }
  function openQuiz(id: string) {
    if (!quizzes[id]) {
      notify("Esta atividade ainda não está disponível.")
      return
    }
    setActiveQuizId(id)
    navigate("quiz")
  }
  function openPractice(kind: PracticeKind) {
    navigate(kind === "compare" ? "prompt-practice" : "verification-practice")
  }
  function createProfile(name: string) {
    saveLocalSignOut(false)
    setIsSignedOut(false)
    setProgress((current) => ({ ...current, profileName: name }))
    navigate("dashboard")
    notify(
      isSignedOut
        ? "Você voltou ao seu perfil local."
        : "Seu espaço local está pronto.",
    )
  }
  function completeLesson(id: string) {
    if (progress.completedLessons.includes(id)) {
      notify("Este módulo já foi concluído; seus XP não serão duplicados.")
      return
    }
    setProgress((current) => ({
      ...claimXp(current, `lesson:${id}`, 25),
      completedLessons: [...current.completedLessons, id],
    }))
    notify("Módulo concluído. +25 XP para sua jornada.")
  }
  function completeQuiz(result: {
    score: number
    total: number
    incorrectTopics: string[]
  }) {
    const resultRecord: QuizResult = {
      ...result,
      completedAt: new Date().toISOString(),
    }
    setProgress((current) => ({
      ...claimXp(current, `quiz:${activeQuizId}`, 15),
      quizResults: { ...current.quizResults, [activeQuizId]: resultRecord },
    }))
    notify("Prática concluída. +15 XP; refazer não concede XP novamente.")
  }
  function completePractice(results: PracticeSubmission[]) {
    const completedAt = new Date().toISOString()
    const newlyEarned = results.reduce(
      (total, result) =>
        total +
        result.correctIds.filter(
          (id) =>
            !progress.rewardClaims.includes(
              `practice:${result.activityId}:${id}`,
            ),
        ).length * result.xpPerCorrect,
      0,
    )
    setProgress((current) => {
      let updated = current
      const practiceResults = { ...current.practiceResults }
      for (const result of results) {
        for (const id of result.correctIds) {
          updated = claimXp(
            updated,
            `practice:${result.activityId}:${id}`,
            result.xpPerCorrect,
          )
        }
        const previous = practiceResults[result.activityId]
        practiceResults[result.activityId] = {
          score: Math.max(previous?.score ?? 0, result.score),
          total: result.total,
          completedAt,
          correctIds: [...new Set([...(previous?.correctIds ?? []), ...result.correctIds])],
        }
      }
      return { ...updated, practiceResults }
    })
    notify(
      newlyEarned
        ? `Atividade registrada. +${newlyEarned} XP pelos acertos.`
        : "Atividade registrada. XP por acerto é concedido uma única vez.",
    )
  }
  function completePlacement(score: number, level: Level) {
    const suggested =
      level === "Iniciante"
        ? "generative-ai"
        : level === "Intermediário"
          ? "prompting"
          : "verification"
    setProgress((current) => ({
      ...current,
      level,
      placementScore: score,
      lastLessonId: suggested,
    }))
    navigate("dashboard")
    notify(`Nível ${level} registrado neste dispositivo.`)
  }
  function createProject(input: {
    title: string
    idea: string
    objective: string
  }) {
    const id = globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}`
    const project: Project = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
      notes: "",
      steps: projectTemplate.map((step) => ({ ...step, complete: false })),
    }
    setProgress((current) => ({
      ...claimXp(current, "project:first", 15),
      projects: [...current.projects, project],
    }))
    notify(
      progress.projects.length
        ? "Projeto criado. Continue seu roteiro."
        : "Primeiro projeto criado. +15 XP para sua jornada.",
    )
  }
  function updateProjectStep(
    projectId: string,
    stepId: string,
    complete: boolean,
  ) {
    setProgress((current) => {
      const project = current.projects.find((item) => item.id === projectId)
      const alreadyComplete = project?.steps.find((step) => step.id === stepId)
        ?.complete
      let next = current
      if (complete && !alreadyComplete)
        next = claimXp(next, `project-step:${projectId}:${stepId}`, 10)
      return {
        ...next,
        projects: next.projects.map((item) =>
          item.id !== projectId
            ? item
            : {
                ...item,
                steps: item.steps.map((step) =>
                  step.id === stepId ? { ...step, complete } : step,
                ),
              },
        ),
      }
    })
  }
  function updateProjectNotes(projectId: string, notes: string) {
    setProgress((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId ? { ...project, notes } : project,
      ),
    }))
  }
  function updatePromptDraft(draft: Progress["promptDraft"]) {
    setProgress((current) => ({ ...current, promptDraft: draft }))
  }
  function updateReflection(lessonId: string, value: string) {
    setProgress((current) => ({
      ...current,
      reflections: { ...current.reflections, [lessonId]: value },
    }))
  }
  function saveName(name: string) {
    setProgress((current) => ({ ...current, profileName: name }))
    notify("Nome atualizado.")
  }
  function signOut() {
    const saved = saveLocalSignOut(true)
    setIsSignedOut(true)
    navigate("welcome")
    notify(
      saved
        ? "Você saiu do perfil local. Seu progresso continua salvo neste navegador."
        : "Você saiu nesta aba, mas o navegador não permitiu salvar o estado para a próxima visita.",
    )
  }
  function clearLocalData() {
    if (
      !window.confirm(
        "Limpar o perfil e todo o progresso armazenado neste navegador? Esta ação não pode ser desfeita.",
      )
    )
      return
    try {
      window.localStorage.removeItem("learnai.progress.v1")
      window.localStorage.removeItem(localSignOutStorageKey)
    } catch {
      /* O estado da tela ainda pode ser reiniciado se o armazenamento estiver indisponível. */
    }
    setIsSignedOut(false)
    setProgress(createEmptyProgress())
    setPage("welcome")
    setActiveLessonId(lessons[0].id)
    notify("Dados locais removidos deste navegador.")
  }

  if (page === "welcome" || !progress.profileName)
    return (
      <>
        <Welcome
          onCreate={createProfile}
          theme={theme}
          onToggleTheme={toggleTheme}
          isReturning={isSignedOut && Boolean(progress.profileName)}
          initialName={isSignedOut ? progress.profileName : ""}
        />
        {toast && (
          <div className="toast" role="status" aria-live="polite">
            {toast}
          </div>
        )}
      </>
    )
  if (page === "quiz") {
    const quiz = quizzes[activeQuizId]
    return (
      <>
        <div className="floating-theme-toggle">
          <ThemeToggle compact theme={theme} onToggle={toggleTheme} />
        </div>
        <QuizView
          key={activeQuizId}
          quiz={quiz}
          onBack={() => navigate("dashboard")}
          onComplete={completeQuiz}
        />
        {toast && (
          <div className="toast" role="status" aria-live="polite">
            {toast}
          </div>
        )}
      </>
    )
  }
  if (page === "lesson") {
    const lesson =
      lessons.find((item) => item.id === activeLessonId) ?? lessons[0]
    return (
      <>
        <div className="floating-theme-toggle">
          <ThemeToggle compact theme={theme} onToggle={toggleTheme} />
        </div>
        <LessonView
          lesson={lesson}
          completed={progress.completedLessons.includes(lesson.id)}
          reflection={progress.reflections[lesson.id] ?? ""}
          onReflection={(value) => updateReflection(lesson.id, value)}
          onBack={() => navigate("path")}
          onComplete={() => completeLesson(lesson.id)}
          onQuiz={openQuiz}
          onStudio={() => navigate("studio")}
          onProjects={() => navigate("projects")}
        />
        {toast && (
          <div className="toast" role="status" aria-live="polite">
            {toast}
          </div>
        )}
      </>
    )
  }
  if (page === "placement")
    return (
      <>
        <div className="floating-theme-toggle">
          <ThemeToggle compact theme={theme} onToggle={toggleTheme} />
        </div>
        <Placement
          onComplete={completePlacement}
          onClose={() => navigate("dashboard")}
        />
        {toast && (
          <div className="toast" role="status" aria-live="polite">
            {toast}
          </div>
        )}
      </>
    )

  const title =
    navigation.find((item) => item.id === page)?.label ?? "Visão geral"
  const activeNavigationPage =
    page === "prompt-practice" || page === "verification-practice"
      ? "path"
      : page
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <Brand />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <span className="sidebar-caption">SUA JORNADA</span>
        <nav aria-label="Navegação principal">
          {navigation.map((item) => (
            <button
              aria-current={activeNavigationPage === item.id ? "page" : undefined}
              className={`nav-item ${activeNavigationPage === item.id ? "nav-active" : ""}`}
              key={item.id}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
              {page === item.id && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-guidance">
          <span>
            <Icon name="shield" size={17} />
          </span>
          <strong>IA com critério.</strong>
          <small>Curiosidade, responsabilidade e autoria.</small>
        </div>
        <button
          className="profile-shortcut"
          onClick={() => navigate("profile")}
        >
          <span className="profile-avatar-small">
            {progress.profileName.slice(0, 1).toUpperCase()}
          </span>
          <span>
            <strong>{progress.profileName}</strong>
            <small>Perfil neste dispositivo</small>
          </span>
          <Icon name="chevron" size={16} />
        </button>
      </aside>
      <div className="app-content">
        <header className="mobile-topbar">
          <Brand />
          <div className="mobile-topbar-actions">
            <span className="mobile-xp">
              <Icon name="spark" size={15} /> {progress.xp} XP
            </span>
            <ThemeToggle compact theme={theme} onToggle={toggleTheme} />
          </div>
        </header>
        <main className="main-content" id="main-content">
          {storageWarning && (
            <div className="storage-warning" role="status">
              <Icon name="lock" size={16} /> O navegador não permitiu salvar.
              Seu progresso pode não permanecer após fechar esta página.
            </div>
          )}
          {page === "dashboard" && (
            <Dashboard
              progress={progress}
              onPage={navigate}
              onLesson={openLesson}
              onQuiz={openQuiz}
              onPractice={openPractice}
              onPlacement={() => navigate("placement")}
            />
          )}
          {page === "path" && (
            <LearningPath
              progress={progress}
              onLesson={openLesson}
              onQuiz={openQuiz}
              onPractice={openPractice}
            />
          )}
          {page === "studio" && (
            <PromptStudio
              progress={progress}
              onDraft={updatePromptDraft}
              onNotify={notify}
            />
          )}
          {page === "projects" && (
            <ProjectLab
              progress={progress}
              onCreate={createProject}
              onStep={updateProjectStep}
              onProjectUpdate={updateProjectNotes}
            />
          )}
          {page === "journey" && (
            <Journey progress={progress} onPage={navigate} onPractice={openPractice} />
          )}
          {page === "prompt-practice" && (
            <PromptComparisonActivity
              onBack={() => navigate("path")}
              onComplete={completePractice}
            />
          )}
          {page === "verification-practice" && (
            <InformationVerificationActivity
              onBack={() => navigate("path")}
              onComplete={completePractice}
            />
          )}
          {page === "plus" && <PlusPage />}
          {page === "profile" && (
            <Profile
              progress={progress}
              onSave={saveName}
              onClear={clearLocalData}
              onPlacement={() => navigate("placement")}
              onSignOut={signOut}
            />
          )}
        </main>
        <footer className="app-footer">
          <span>
            LEARN AI <i>·</i> APRENDER A QUESTIONAR TAMBÉM É APRENDER.
          </span>
          <span>Versão local de demonstração</span>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="Navegação móvel">
        {navigation.slice(0, 6).map((item) => (
          <button
            aria-current={activeNavigationPage === item.id ? "page" : undefined}
            className={activeNavigationPage === item.id ? "mobile-nav-active" : ""}
            key={item.id}
            onClick={() => navigate(item.id)}
          >
            <Icon name={item.icon} size={19} />
            <span>
              {item.id === "dashboard"
                ? "Início"
                : item.id === "path"
                  ? "Trilha"
                  : item.id === "studio"
                    ? "Prompts"
                    : item.id === "projects"
                      ? "Projetos"
                      : item.id === "journey"
                        ? "Jornada"
                        : "Plus"}
            </span>
          </button>
        ))}
      </nav>
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <Icon name="check" size={17} />
          {toast}
        </div>
      )}
    </div>
  )
}

export default App
