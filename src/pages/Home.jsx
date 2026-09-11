import { lazy, Suspense, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import { scrollToId } from '../lib/scroll.js'

const Directory = lazy(() => import('../components/Directory.jsx'))
const Featured = lazy(() => import('../components/Featured.jsx'))
const Archive = lazy(() => import('../components/Archive.jsx'))
const About = lazy(() => import('../components/About.jsx'))

export default function Home() {
  const { hash } = useLocation()
  const seen = useRef('')
  const reloadBoot = useRef(
    typeof performance !== 'undefined' &&
      (performance.getEntriesByType?.('navigation')?.[0]?.type === 'reload' ||
        performance.navigation?.type === 1),
  )

  useEffect(() => {
    if (reloadBoot.current) {
      reloadBoot.current = false
      seen.current = hash
      window.scrollTo(0, 0)
      return
    }
    if (!hash || hash === seen.current) return
    seen.current = hash
    const id = hash.slice(1)
    requestAnimationFrame(() => scrollToId(id))
  }, [hash])

  return (
    <>
      <Hero />
      <Suspense fallback={<div className="home-rest-slot" aria-hidden="true" />}>
        <Directory />
        <Featured />
        <div className="home-sheet home-sheet--paper">
          <Archive />
        </div>
        <div className="home-sheet home-sheet--ink" id="about">
          <About />
        </div>
      </Suspense>
    </>
  )
}
