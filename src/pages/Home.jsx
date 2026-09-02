import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import About from '../components/About.jsx'
import Archive from '../components/Archive.jsx'
import Contact from '../components/Contact.jsx'
import Directory from '../components/Directory.jsx'
import Featured from '../components/Featured.jsx'
import Hero from '../components/Hero.jsx'

export default function Home() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const el = document.querySelector(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
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

