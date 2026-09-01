import { Canvas } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import TimeSnackScene from '../components/film/TimeSnackScene.jsx'
import { FILM_DURATION, FILM_FPS, evaluateFilm, formatTimecode } from '../cinematics/timeSnackFilm.js'
import { useLang } from '../i18n.jsx'

function pickMime() {
  const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
  return types.find((t) => window.MediaRecorder?.isTypeSupported(t)) || ''
}

export default function Film() {
  const { lang } = useLang()
  const timeRef = useRef(0)
  const playingRef = useRef(true)
  const canvasRef = useRef(null)
  const hudTime = useRef(null)
  const hudShot = useRef(null)
  const [uhd, setUhd] = useState(false)
  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)

  const onFrame = useCallback((_t, film) => {
    if (hudTime.current) hudTime.current.textContent = formatTimecode(_t)
    if (hudShot.current) hudShot.current.textContent = lang === 'zh' ? film.shotZh : film.shot
  }, [lang])

  const replay = () => {
    timeRef.current = 0
    playingRef.current = true
  }

  useEffect(() => {
    const film = evaluateFilm(0)
    if (hudShot.current) hudShot.current.textContent = lang === 'zh' ? film.shotZh : film.shot
  }, [lang])

  useEffect(() => {
    const el = document.querySelector('.film')
    if (!el) return
    const apply = () => {
      const s = Math.min(window.innerWidth / 3840, window.innerHeight / 2160)
      el.style.setProperty('--film-scale', String(Number.isFinite(s) && s > 0 ? s : 0.25))
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [uhd])

  const export4k = async () => {
    if (busy || !canvasRef.current) return
    const mime = pickMime()
    if (!mime) {
      window.alert(lang === 'zh' ? '当前浏览器不支持录制 WebM。请改用 Chrome / Edge。' : 'This browser cannot record WebM. Use Chrome or Edge.')
      return
    }
    setBusy(true)
    setUhd(true)
    await new Promise((r) => setTimeout(r, 450))
    const canvas = canvasRef.current
    const stream = canvas.captureStream(FILM_FPS)
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 48_000_000 })
    const chunks = []
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data)
    }
    const stopped = new Promise((resolve) => {
      rec.onstop = resolve
    })
    replay()
    setRecording(true)
    rec.start()
    await new Promise((r) => setTimeout(r, FILM_DURATION * 1000 + 280))
    if (rec.state !== 'inactive') rec.stop()
    await stopped
    setRecording(false)
    setUhd(false)
    const blob = new Blob(chunks, { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'time-snack-inn-8s-4k.webm'
    a.click()
    URL.revokeObjectURL(url)
    setBusy(false)
  }

  return (
    <div className={`film ${uhd ? 'is-uhd' : ''}`}>
      <div className="film-stage">
        <Canvas
          shadows
          camera={{ position: [6, 1, 8], fov: 33, near: 0.05, far: 80 }}
          dpr={uhd ? 1 : [1, 1.5]}
          gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            canvasRef.current = gl.domElement
            gl.outputColorSpace = 'srgb'
            gl.toneMappingExposure = 1.05
          }}
        >
          <Suspense fallback={null}>
            <TimeSnackScene timeRef={timeRef} playingRef={playingRef} onFrame={onFrame} />
          </Suspense>
        </Canvas>
      </div>

      <div className="film-hud">
        <div className="film-hud-top">
          <Link to="/work/time-snack-inn">{lang === 'zh' ? '← 返回项目' : '← Back'}</Link>
          <p className={`film-rec ${recording ? 'on' : ''}`}>{recording ? 'REC ● 4K' : 'UHD 3840×2160 · 8.00s · 30fps'}</p>
        </div>
        <div className="film-hud-mid">
          <p className="film-shot" ref={hudShot}>
            {lang === 'zh' ? '远及近 · 低至上推进' : 'DOLLY IN · CRANE UP'}
          </p>
          <p className="film-time" ref={hudTime}>
            00:00:00:00
          </p>
        </div>
        <div className="film-hud-bot">
          <p>TIME SNACK INN · 食光小栈 · 坚果礼盒</p>
          <div className="film-actions">
            <button type="button" onClick={replay} disabled={busy}>
              {lang === 'zh' ? '重播 8s' : 'Replay 8s'}
            </button>
            <button type="button" className="film-export" onClick={export4k} disabled={busy}>
              {busy ? (lang === 'zh' ? '导出中…' : 'Exporting…') : lang === 'zh' ? '导出 4K' : 'Export 4K'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
