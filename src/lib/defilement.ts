import type Lenis from 'lenis'

/**
 * Défilement du site : instance Lenis partagée (défilement doux) et liens d'ancre.
 * Certaines ancres n'ont pas de position fixe dans la page (ex. un chapitre à l'intérieur
 * de la séquence épinglée) : elles s'enregistrent ici avec une fonction qui calcule leur position.
 */

let lenis: Lenis | null = null
const ancres = new Map<string, () => number>()

export const setLenis = (instance: Lenis | null) => {
  lenis = instance
}

export const getLenis = () => lenis

export function enregistrerAncre(hash: string, position: () => number) {
  ancres.set(hash, position)
  return () => {
    ancres.delete(hash)
  }
}

function hauteurHeader() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0
}

export function defilerVers(hash: string) {
  let y: number
  const speciale = ancres.get(hash)
  if (speciale) {
    y = speciale()
  } else if (hash === '#accueil') {
    y = 0
  } else {
    const cible = document.querySelector<HTMLElement>(hash)
    if (!cible) return
    y = cible.getBoundingClientRect().top + window.scrollY - hauteurHeader()
  }

  if (lenis) {
    lenis.scrollTo(y, { duration: 1.6 })
  } else {
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: y, behavior: reduit ? 'auto' : 'smooth' })
  }
}

/** Intercepte les clics sur les liens internes (#...) pour passer par defilerVers. */
export function installerLiensAncres() {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const lien = (e.target as Element | null)?.closest?.('a[href^="#"]')
    if (!lien || lien.classList.contains('lien-evitement')) return
    const hash = lien.getAttribute('href') ?? ''
    if (hash.length < 2) return
    e.preventDefault()
    // On attend une image : le menu mobile a le temps de se fermer avant la mesure
    requestAnimationFrame(() => defilerVers(hash))
  }
  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
