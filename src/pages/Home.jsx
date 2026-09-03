import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import About from '../components/About.jsx'
import Archive from '../components/Archive.jsx'
import Contact from '../components/Contact.jsx'
import Directory from '../components/Directory.jsx'
import Featured from '../components/Featured.jsx'
import Hero from '../components/Hero.jsx'
import { scrollToId } from '../lib/scroll.js'

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
      <Directory />
      <Featured />
      <Archive />
      <About />
      <Contact />
    </>
  )
}
