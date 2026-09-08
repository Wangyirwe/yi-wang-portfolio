import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import { scrollToId } from '../lib/scroll.js'

const Directory = lazy(() => import('../components/Directory.jsx'))
const Featured = lazy(() => import('../components/Featured.jsx'))
const Archive = lazy(() => import('../components/Archive.jsx'))
const About = lazy(() => import('../components/About.jsx'))
const Contact = lazy(() => import('../components/Contact.jsx'))

const needsRestNow = () => {
  const hash = typeof window !== 'undefined' ? window.location.hash : ''
  return Boolean(hash && hash !== '#top' && hash !== '#persona')
}

export default function Home() {
  const { hash } = useLocation()
  const seen = useRef('')
  const [rest, setRest] = useState(needsRestNow)
  const reloadBoot = useRef(
    typeof performance !== 'undefined' &&
      (performance.getEntriesByType?.('navigation')?.[0]?.type === 'reload' ||
        performance.navigation?.type === 1),
  )

  useEffect(() => {
    if (rest) return undefined
    const show = () => setRest(true)
    const onMsg = (event) => {
      if (event.data?.type === 'yw-sylva-quiet') show()
    }
    window.addEventListener('message', onMsg)
    const timer = window.setTimeout(show, 6500)
    return () => {
      window.removeEventListener('message', onMsg)
      window.clearTimeout(timer)
    }
  }, [rest])

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
      {rest ? (
        <Suspense fallback={null}>
          <Directory />
          <Featured />
          <Archive />
          <About />
          <Contact />
        </Suspense>
      ) : null}
    </>
  )
}
