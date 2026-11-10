
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react'

import SplashScreen from './SplashScreen'

describe('SplashScreen', () => {
  beforeEach(() => {
    vi.spyOn(
      HTMLMediaElement.prototype,
      'pause',
    ).mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('deve renderizar a tela de carregamento corretamente', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true }),
    )

    const onComplete = vi.fn()
    const fetchMock = vi.fn()

    vi.stubGlobal('fetch', fetchMock)

    render(<SplashScreen onComplete={onComplete} />)

    expect(
      screen.getByRole('status', {
        name: 'Carregando Learn AI',
      }),
    ).toBeTruthy()

    const video = document.querySelector('video')

    expect(video).not.toBeNull()
    expect(video?.muted).toBe(true)
    expect(video?.playsInline).toBe(true)

    expect(onComplete).toHaveBeenCalledWith('reduced-motion')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('deve informar erro quando não conseguir carregar o vídeo', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false }),
    )

    const onComplete = vi.fn()
    const fetchMock = vi.fn().mockRejectedValue(
      new Error('Vídeo indisponível'),
    )

    vi.stubGlobal('fetch', fetchMock)

    render(<SplashScreen onComplete={onComplete} />)

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith('playback-error')
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('deve informar erro quando o servidor retornar resposta inválida', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false }),
    )

    const onComplete = vi.fn()
    const blobMock = vi.fn()

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      blob: blobMock,
    })

    vi.stubGlobal('fetch', fetchMock)

    render(<SplashScreen onComplete={onComplete} />)

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith('playback-error')
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(blobMock).not.toHaveBeenCalled()
  })

  it('deve concluir o carregamento seis segundos após o primeiro frame', async () => {
    vi.useFakeTimers()

    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false }),
    )

    const onComplete = vi.fn()
    const videoBlob = new Blob(['video'])

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(videoBlob),
    })

    const createObjectURLMock = vi.fn().mockReturnValue(
      'blob:learn-ai-test',
    )

    const revokeObjectURLMock = vi.fn()

    vi.stubGlobal('fetch', fetchMock)

    vi.stubGlobal('URL', {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    })

    const loadMock = vi.spyOn(
      HTMLMediaElement.prototype,
      'load',
    ).mockImplementation(() => {})

    const playMock = vi.spyOn(
      HTMLMediaElement.prototype,
      'play',
    ).mockResolvedValue(undefined)

    vi.stubGlobal(
      'requestAnimationFrame',
      (callback: FrameRequestCallback) => {
        callback(performance.now())
        return 1
      },
    )

    render(<SplashScreen onComplete={onComplete} />)

    const video = document.querySelector('video') as HTMLVideoElement

    expect(video).not.toBeNull()

    Object.defineProperty(video, 'requestVideoFrameCallback', {
      configurable: true,
      value: undefined,
    })

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(createObjectURLMock).toHaveBeenCalledWith(videoBlob)
    expect(loadMock).toHaveBeenCalledTimes(1)

    act(() => {
      video.dispatchEvent(new Event('canplay'))
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(playMock).toHaveBeenCalledTimes(1)
    expect(video.playbackRate).toBe(1)

    act(() => {
      video.dispatchEvent(new Event('playing'))
    })

    expect(onComplete).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5999)
    })

    expect(onComplete).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('complete')
  })
})
