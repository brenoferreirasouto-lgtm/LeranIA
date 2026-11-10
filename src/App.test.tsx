
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
import { storageKey } from './lib/progress'

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
})
