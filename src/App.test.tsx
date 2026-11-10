
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'

import App from './App'
import { createEmptyProgress, storageKey } from './lib/progress'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('scrollTo', vi.fn())
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('deve exibir a tela de boas-vindas quando não existe perfil local', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Comece por aqui',
      }),
    ).toBeTruthy()

    expect(
      screen.getByLabelText('Como podemos chamar você?'),
    ).toBeTruthy()
  })

  it('deve criar um perfil local e abrir o painel inicial', async () => {
    render(<App />)

    const nameInput = screen.getByLabelText(
      'Como podemos chamar você?',
    )

    fireEvent.change(nameInput, {
      target: { value: 'Bruno' },
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Criar meu espaço',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Olá, Bruno.',
      }),
    ).toBeTruthy()

    await waitFor(() => {
      const saved = JSON.parse(
        localStorage.getItem(storageKey) ?? 'null',
      )

      expect(saved.profileName).toBe('Bruno')
    })
  })

  it('deve permitir sair e retornar ao perfil local sem perder o progresso', async () => {
    const savedProgress = createEmptyProgress()

    savedProgress.profileName = 'Bruno'
    savedProgress.xp = 45

    localStorage.setItem(
      storageKey,
      JSON.stringify(savedProgress),
    )

    render(<App />)

    fireEvent.click(
      screen.getByRole('button', {
        name: /Bruno Perfil neste dispositivo/,
      }),
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Sair do perfil neste dispositivo',
      }),
    )

    expect(
      screen.getByRole('heading', {
        name: 'Continue seu percurso',
      }),
    ).toBeTruthy()

    const nameInput = screen.getByLabelText(
      'Nome de exibição',
    ) as HTMLInputElement

    expect(nameInput.value).toBe('Bruno')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Continuar meu percurso',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Olá, Bruno.',
      }),
    ).toBeTruthy()

    await waitFor(() => {
      const saved = JSON.parse(
        localStorage.getItem(storageKey) ?? 'null',
      )

      expect(saved.profileName).toBe('Bruno')
      expect(saved.xp).toBe(45)
    })

    expect(
      localStorage.getItem('learnai.session.signed-out.v1'),
    ).toBeNull()
  })

  it('deve recuperar um perfil salvo e abrir o painel inicial', () => {
    const savedProgress = createEmptyProgress()

    savedProgress.profileName = 'Bruno'

    localStorage.setItem(
      storageKey,
      JSON.stringify(savedProgress),
    )

    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Olá, Bruno.',
      }),
    ).toBeTruthy()
  })
})
