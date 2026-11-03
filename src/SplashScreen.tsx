import { useEffect, useRef } from "react"

type SplashResult = "complete" | "playback-error" | "reduced-motion"

type SplashScreenProps = {
  onComplete: (result: SplashResult) => void
}

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    callback: (now: number, metadata: { presentationTime: number }) => void,
  ) => number
  cancelVideoFrameCallback?: (handle: number) => void
}

const splashDurationMs = 6000
const splashVideoUrl = `${import.meta.env.BASE_URL}assets/learn-ai-loading.mp4`
let splashVideoPromise: Promise<Blob> | undefined

function preloadSplashVideo() {
  if (!splashVideoPromise) {
    splashVideoPromise = fetch(splashVideoUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Vídeo de abertura indisponível.")
        return response.blob()
      })
      .catch((error: unknown) => {
        splashVideoPromise = undefined
        throw error
      })
  }

  return splashVideoPromise
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const video = videoRef.current as VideoWithFrameCallback | null
    if (!video) return

    let active = true
    let finished = false
    let timerId: number | undefined
    let loadTimeoutId: number | undefined
    let frameCallbackId: number | undefined
    let animationFrameId: number | undefined
    let objectUrl: string | undefined
    let cancelReadinessWait: (() => void) | undefined
    const finish = (result: SplashResult) => {
      if (!active || finished) return
      finished = true
      onCompleteRef.current(result)
    }

    const beginSixSecondWindow = (firstFrameTime: number) => {
      if (!active || finished || timerId !== undefined) return

      const deadline = firstFrameTime + splashDurationMs
      const finishAtDeadline = () => {
        if (!active || finished) return
        const remaining = deadline - performance.now()
        if (remaining > 0) {
          timerId = window.setTimeout(finishAtDeadline, remaining)
          return
        }
        finish("complete")
      }

      finishAtDeadline()
    }

    const handleFirstPresentedFrame = (
      now: number,
      metadata?: { presentationTime: number },
    ) => {
      frameCallbackId = undefined
      beginSixSecondWindow(metadata?.presentationTime ?? now)
    }

    const handleCanPlay = () => {
      if (!active || finished) return

      video.playbackRate = 1
      video.defaultPlaybackRate = 1
      video.loop = false

      if (!video.requestVideoFrameCallback) {
        video.addEventListener(
          "playing",
          () => {
            animationFrameId = window.requestAnimationFrame((now) =>
              handleFirstPresentedFrame(now),
            )
          },
          { once: true },
        )
      }

      void video.play().catch(() => finish("playback-error"))
    }

    const waitUntilPlayable = () =>
      new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          video.removeEventListener("canplay", onCanPlay)
          video.removeEventListener("error", onError)
          cancelReadinessWait = undefined
        }
        const onCanPlay = () => {
          cleanup()
          resolve()
        }
        const onError = () => {
          cleanup()
          reject(new Error("O vídeo de abertura não pôde ser decodificado."))
        }

        video.addEventListener("canplay", onCanPlay)
        video.addEventListener("error", onError)
        cancelReadinessWait = cleanup
        video.src = objectUrl!
        if (video.requestVideoFrameCallback) {
          frameCallbackId = video.requestVideoFrameCallback((now, metadata) =>
            handleFirstPresentedFrame(now, metadata),
          )
        }
        video.load()

        if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) onCanPlay()
      })

    const loadAndPlay = async () => {
      try {
        const videoBlob = await preloadSplashVideo()
        if (!active || finished) return

        objectUrl = URL.createObjectURL(videoBlob)
        await waitUntilPlayable()
        if (!active || finished) return

        handleCanPlay()
      } catch {
        if (active) finish("playback-error")
      }
    }

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches

    if (prefersReducedMotion) {
      finish("reduced-motion")
    } else {
      document.documentElement.classList.add("learn-ai-splash-active")
      loadTimeoutId = window.setTimeout(() => {
        finish("playback-error")
      }, 12000)
      void loadAndPlay()
    }

    return () => {
      active = false
      cancelReadinessWait?.()
      if (timerId !== undefined) window.clearTimeout(timerId)
      if (loadTimeoutId !== undefined) window.clearTimeout(loadTimeoutId)
      if (frameCallbackId !== undefined) {
        video.cancelVideoFrameCallback?.(frameCallbackId)
      }
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId)
      }
      video.pause()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      document.documentElement.classList.remove("learn-ai-splash-active")
    }
  }, [])

  return (
    <div
      className="learn-ai-splash"
      role="status"
      aria-label="Carregando Learn AI"
    >
      <span className="learn-ai-splash__announcement">Carregando Learn AI</span>
      <video
        ref={videoRef}
        className="learn-ai-splash__video"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  )
}
