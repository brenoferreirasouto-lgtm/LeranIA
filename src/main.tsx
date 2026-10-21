import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import SplashScreen from "./SplashScreen"
import "./index.css"

function LearnAiRoot() {
  const [splashVisible, setSplashVisible] = useState(true)
  const [playbackNotice, setPlaybackNotice] = useState("")

  useEffect(() => {
    if (!playbackNotice) return
    const timeoutId = window.setTimeout(() => setPlaybackNotice(""), 6000)
    return () => window.clearTimeout(timeoutId)
  }, [playbackNotice])

  return (
    <>
      <div
        className={splashVisible ? "learn-ai-app-under-splash" : undefined}
        aria-hidden={splashVisible}
        inert={splashVisible}
      >
        <App />
      </div>
      {splashVisible && (
        <SplashScreen
          onComplete={(result) => {
            setSplashVisible(false)
            if (result === "playback-error") {
              setPlaybackNotice(
                "Não foi possível reproduzir o vídeo de abertura. O Learn AI foi aberto normalmente.",
              )
            }
          }}
        />
      )}
      {playbackNotice && (
        <div className="toast" role="status">
          {playbackNotice}
        </div>
      )}
    </>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LearnAiRoot />
  </React.StrictMode>,
)
