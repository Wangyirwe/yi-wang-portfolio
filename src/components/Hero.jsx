import { useEffect, useRef, useState } from 'react'
import { chips } from '../data/works.js'
import { useLang } from '../i18n.jsx'

export default function Hero() {
  const { lang, t, pick } = useLang()
  const rootRef = useRef(null)
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const root = rootRef.current
    if (!video || !root) return

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true

    const tryPlay = () => {
      const play = video.play()
      if (play) play.catch(() => {})
    }

    const onReady = () => {
      setReady(true)
      tryPlay()
    }

    video.addEventListener('loadeddata', onReady)
    video.addEventListener('canplay', tryPlay)
    if (video.readyState >= 2) onReady()
    tryPlay()

    const onVisible = () => {
      if (document.hidden) video.pause()
      else tryPlay()
    }
    document.addEventListener('visibilitychange', onVisible)

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay()
        else video.pause()
      },
      { threshold: 0.12 },
    )
    io.observe(root)

    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const target = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }

    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      target.x = x
      target.y = y
    }

    const tick = () => {
      cur.x += (target.x - cur.x) * 0.055
      cur.y += (target.y - cur.y) * 0.055
      root.style.setProperty('--mx', cur.x.toFixed(4))
      root.style.setProperty('--my', cur.y.toFixed(4))
      raf = requestAnimationFrame(tick)
    }

    if (fine && !reduce) {
      window.addEventListener('pointermove', onMove, { passive: true })
      raf = requestAnimationFrame(tick)
    }

    return () => {
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('canplay', tryPlay)
      document.removeEventListener('visibilitychange', onVisible)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className={`hero is-film ${ready ? 'is-ready' : ''}`} id="top" ref={rootRef}>
      <div className="hero-stage" aria-hidden="true">
        <div className="hero-video-frame">
          <video
            ref={videoRef}
            className="hero-video"
            src="/video/hero-clean.mp4"
            poster="/images/time-snack/three-quarter.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="hero-wm-hide" />
        </div>
        <div className="hero-dim" />
        <div className="hero-grain" />
        <div className="hero-vignette" />
      </div>

      <div className="hero-content">
        <div className="hero-meta">
          <p className="kicker">{t('heroKicker')}</p>
          <p className="status">{t('status')}</p>
        </div>

        <div className="hero-grid">
          <div className="hero-type">
            <p className="hero-role">{t('role')}</p>
            <h1>
              <span className="line">YI</span>
              <span className="line">WANG</span>
            </h1>
            <p className="hero-cn">{lang === 'zh' ? '王一' : 'Yi Wang'}</p>
          </div>

          <figure className="hero-photo">
            <img src="/images/portrait.jpg?v=3" alt={lang === 'zh' ? '王一' : 'Yi Wang'} />
          </figure>
        </div>

        <ul className="chips">
          {chips.map((c) => (
            <li key={c.en}>{pick(c)}</li>
          ))}
        </ul>

        <a className="scroll" href="#series">
          {t('scroll')}
        </a>
      </div>
    </section>
  )
}
