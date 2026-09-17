import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Header from './components/Header'
import Sequence from './components/Sequence'
import Bandeau from './components/Bandeau'
import Carte from './components/Carte'
import Ambiance from './components/Ambiance'
import Infos from './components/Infos'
import Reserver from './components/Reserver'
import Footer from './components/Footer'
import { useReveal } from './hooks/useReveal'
import { useInclinaison } from './hooks/useInclinaison'
import { installerLiensAncres, setLenis } from './lib/defilement'

export default function App() {
  useReveal()
  useInclinaison()

  useEffect(() => {
    const retirerLiens = installerLiensAncres()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return retirerLiens

    // Défilement doux à la molette, synchronisé avec ScrollTrigger (le tactile reste natif)
    const lenis = new Lenis({ lerp: 0.12 })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (temps: number) => lenis.raf(temps * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
      retirerLiens()
    }
  }, [])

  return (
    <>
      <a href="#contenu" className="lien-evitement">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu">
        <Sequence />
        <Bandeau />
        <Carte />
        <Ambiance />
        <Infos />
        <Reserver />
      </main>
      <Footer />
    </>
  )
}
