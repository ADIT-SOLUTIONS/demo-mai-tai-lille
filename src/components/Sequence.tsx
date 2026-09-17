import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Soleil from './Soleil'
import { useStatut } from '../hooks/useStatut'
import { ADRESSE } from '../data/infos'
import { enregistrerAncre } from '../lib/defilement'

gsap.registerPlugin(ScrollTrigger, useGSAP)
ScrollTrigger.config({ ignoreMobileResize: true })

const TITRE = 'Maï-Taï'

type Chapitre = {
  numero: string
  surtitre: string
  titre: string
  texte: string
  citation?: { texte: string; auteur: string }
  lien?: { href: string; label: string }
  image: { src: string; alt: string; largeur: number; hauteur: number; position?: string }
}

const CHAPITRES: Chapitre[] = [
  {
    numero: '01',
    surtitre: 'Depuis le 27 août 2026',
    titre: '24 rue Royale',
    texte:
      "À la place de l'ancienne Cantina, en plein Vieux-Lille. Mur végétal, bouddhas, bois clair et objets rapportés de Thaïlande : le décor a été entièrement repensé.",
    image: {
      src: '/images/mur-vegetal-bar.webp',
      alt: 'Le mur végétal derrière le comptoir, avec ses étagères de bouteilles et un portrait de Bouddha',
      largeur: 960,
      hauteur: 640,
      position: '50% 40%',
    },
  },
  {
    numero: '02',
    surtitre: 'Les fondateurs',
    titre: 'Deux amis',
    texte:
      "Reda et Steven partagent le même amour pour la Thaïlande. Après de nombreux voyages là-bas, ils ont cherché le bon local à Lille pendant deux ans.",
    citation: { texte: '« On adore ce pays et on voulait créer un lieu qui nous ressemble. »', auteur: 'Reda et Steven' },
    image: {
      src: '/images/comptoir-bouddha.webp',
      alt: 'Deux barmans derrière le comptoir éclairé en vert, sous un grand portrait de Bouddha',
      largeur: 1125,
      hauteur: 1880,
      position: '50% 42%',
    },
  },
  {
    numero: '03',
    surtitre: 'La cuisine',
    titre: 'Jaruwan en cuisine',
    texte:
      "La femme de Steven, thaïlandaise, prépare des tapas inspirées de la cuisine de son pays : Poh Pia, poulet satay, crevettes croustillantes… de quoi grignoter à plusieurs autour d'un verre.",
    lien: { href: '#carte', label: 'Découvrir la carte' },
    image: {
      src: '/images/ambiance-soiree.webp',
      alt: 'Soirée au comptoir du Maï-Taï, néons verts et lumière rose au plafond',
      largeur: 1125,
      hauteur: 1880,
      position: '50% 55%',
    },
  },
]

// Repères de la timeline (unités arbitraires, la durée totale est répartie sur la distance de scroll)
const T = {
  lettres: 0.4,
  allumage: 2.1,
  traversee: 3.3,
  portail: 4.0,
  chapitres: 5.0,
  dureeChapitre: 1.8,
}

export default function Sequence() {
  const racine = useRef<HTMLElement>(null)
  const statut = useStatut()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          anime: '(prefers-reduced-motion: no-preference) and (min-height: 540px)',
          mobile: '(max-width: 640px)',
        },
        (contexte) => {
          const { anime, mobile } = contexte.conditions as { anime: boolean; mobile: boolean }
          const section = racine.current
          if (!anime || !section) return

          section.classList.add('sequence--anime')
          const q = gsap.utils.selector(section)
          const scene = q('.sequence__scene')[0] as HTMLElement
          const soleil = q('.sequence__soleil')[0] as HTMLElement
          const portail = q('.sequence__portail')[0] as HTMLElement
          const progression = q('.sequence__progression')[0] as HTMLElement
          const images = q('.chapitre__image')
          const chapitres = q('.chapitre')

          // Centre du soleil dans la scène (les offsets ignorent les transformations en cours)
          const centre = () => {
            let x = soleil.offsetWidth / 2
            let y = soleil.offsetHeight / 2
            let noeud: HTMLElement | null = soleil
            while (noeud && noeud !== scene) {
              x += noeud.offsetLeft
              y += noeud.offsetTop
              noeud = noeud.offsetParent as HTMLElement | null
            }
            return { x, y }
          }
          const cercle = (rayon: 'zero' | 'plein') => () => {
            const { x, y } = centre()
            const r =
              rayon === 'zero'
                ? 0
                : Math.hypot(Math.max(x, scene.offsetWidth - x), Math.max(y, scene.offsetHeight - y)) + 20
            return `circle(${r}px at ${x}px ${y}px)`
          }

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: scene,
              start: 'top top',
              end: () => `+=${window.innerHeight * (mobile ? 4 : 4.6)}`,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: () => {
                const t = tl.time()
                const actif = t < T.chapitres - 0.3 ? -1 : Math.min(CHAPITRES.length - 1, Math.floor((t - T.chapitres + 0.35) / T.dureeChapitre))
                progression.dataset.actif = String(actif)
              },
            },
          })

          // 1. Les tubes se dessinent, les lettres s'allument une à une
          tl.to(q('.sequence__indice'), { autoAlpha: 0, duration: 0.3 }, 0)
          tl.fromTo(q('.soleil--trace .tube'), { strokeDashoffset: 1.02 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.07 }, 0)
          tl.fromTo(q('.lettre'), { '--a': 0 }, { '--a': 1, duration: 0.35, stagger: 0.22, ease: 'power1.in' }, T.lettres)

          // 2. L'enseigne grésille puis s'allume, le dessin laisse place à la photo
          tl.fromTo(
            q('.sequence__nuit'),
            { opacity: 0.9 },
            {
              keyframes: [
                { opacity: 0.35, duration: 0.08 },
                { opacity: 0.85, duration: 0.06 },
                { opacity: 0.2, duration: 0.08 },
                { opacity: 0.7, duration: 0.05 },
                { opacity: 0, duration: 0.35 },
              ],
            },
            T.allumage,
          )
          tl.fromTo(q('.sequence__halo'), { opacity: 0 }, { opacity: 1, duration: 0.5 }, T.allumage + 0.1)
          tl.to(soleil, { opacity: 0, duration: 0.5 }, T.allumage + 0.3)

          // 3. Traversée : zoom dans le soleil, un cercle s'ouvre sur le bar
          tl.to(
            q('.sequence__accueil'),
            { autoAlpha: 0, x: mobile ? 0 : -60, y: mobile ? 30 : 0, duration: 0.6, ease: 'power1.in' },
            T.traversee,
          )
          tl.to(q('.sequence__enseigne'), { scale: mobile ? 4.5 : 5, duration: 1.7, ease: 'power2.in' }, T.traversee)
          tl.fromTo(portail, { clipPath: cercle('zero') }, { clipPath: cercle('plein'), duration: 1, ease: 'power2.in' }, T.portail)
          tl.fromTo(images[0], { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'power2.out' }, T.portail)
          tl.fromTo(progression, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, T.chapitres - 0.4)

          // 4. Les chapitres
          chapitres.forEach((chapitre, i) => {
            const debut = T.chapitres + i * T.dureeChapitre
            const lignes = chapitre.querySelectorAll('[data-ligne]')
            tl.fromTo(lignes, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }, debut)
            if (i < chapitres.length - 1) {
              tl.to(lignes, { autoAlpha: 0, y: -30, duration: 0.35, stagger: 0.04, ease: 'power1.in' }, debut + 1.25)
              tl.fromTo(
                images[i + 1],
                { autoAlpha: 0, scale: 1.12 },
                { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power1.out' },
                debut + 1.35,
              )
            }
          })
          tl.addLabel('le-bar', T.chapitres + 0.6)
          tl.to({}, { duration: 0.6 })

          const retirerAncre = enregistrerAncre('#le-bar', () => tl.scrollTrigger?.labelToScroll('le-bar') ?? 0)
          document.fonts?.ready.then(() => ScrollTrigger.refresh())

          return () => {
            retirerAncre()
            section.classList.remove('sequence--anime')
          }
        },
      )
    },
    { scope: racine },
  )

  return (
    <section id="accueil" className="sequence" ref={racine}>
      <div className="sequence__scene">
        <div className="container sequence__grille">
          <div className="sequence__accueil">
            <p className="surtitre">Bar thaï · {ADRESSE.quartier}</p>
            <h1 className="sequence__titre">
              <span className="sr-only">{TITRE}</span>
              <span aria-hidden="true">
                {Array.from(TITRE).map((lettre, i) => (
                  <span key={i} className="lettre">
                    {lettre}
                  </span>
                ))}
              </span>
            </h1>
            <p className="sequence__intro">
              Tapas thaïlandaises, cocktails aux airs de vacances et pressions locales. Une escale en Thaïlande au{' '}
              {ADRESSE.rue}, sans quitter Lille.
            </p>
            <div className="sequence__actions">
              <a href="#carte" className="btn btn--neon">
                Voir la carte
              </a>
              <a href="#reserver" className="btn btn--contour">
                Réserver
              </a>
            </div>
            <a href="#infos" className={`statut ${statut.ouvert ? 'statut--ouvert' : ''}`}>
              <span className="statut__point" aria-hidden="true" />
              {statut.libelle}
            </a>
          </div>

          <figure className="sequence__enseigne">
            <div className="sequence__halo" aria-hidden="true" />
            <div className="sequence__cadre">
              <picture>
                <source media="(max-width: 640px)" srcSet="/images/enseigne-neon-mobile.webp" />
                <source media="(max-width: 960px)" srcSet="/images/enseigne-neon-640.webp" />
                <img
                  src="/images/enseigne-neon.webp"
                  alt="L'enseigne néon verte du Maï-Taï, un soleil au-dessus du nom du bar, sur le mur végétal"
                  width="1125"
                  height="1870"
                  fetchPriority="high"
                />
              </picture>
              <div className="sequence__nuit" aria-hidden="true" />
            </div>
            <div className="sequence__soleil" aria-hidden="true">
              <Soleil className="soleil--eteint" />
              <Soleil className="soleil--trace" trace />
            </div>
            <p className="sequence__indice" aria-hidden="true">
              Faites défiler pour allumer le néon
            </p>
          </figure>
        </div>

        <div id="le-bar" className="sequence__portail">
          {CHAPITRES.map((chapitre) => (
            <article key={chapitre.numero} className="chapitre">
              <div className="chapitre__image">
                <img
                  src={chapitre.image.src}
                  alt={chapitre.image.alt}
                  width={chapitre.image.largeur}
                  height={chapitre.image.hauteur}
                  loading="lazy"
                  style={{ objectPosition: chapitre.image.position }}
                />
                <div className="chapitre__voile" aria-hidden="true" />
              </div>
              <div className="container chapitre__contenu">
                <div className="chapitre__texte">
                  <p className="surtitre" data-ligne>
                    {chapitre.surtitre}
                  </p>
                  <h2 className="titre chapitre__titre" data-ligne>
                    {chapitre.titre}
                  </h2>
                  <p className="chapitre__paragraphe" data-ligne>
                    {chapitre.texte}
                  </p>
                  {chapitre.citation && (
                    <blockquote className="citation" data-ligne>
                      <p>{chapitre.citation.texte}</p>
                      <footer>{chapitre.citation.auteur}</footer>
                    </blockquote>
                  )}
                  {chapitre.lien && (
                    <a href={chapitre.lien.href} className="lien-fleche chapitre__lien" data-ligne>
                      {chapitre.lien.label}
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="sequence__progression" data-actif="-1" aria-hidden="true">
          {CHAPITRES.map((chapitre, i) => (
            <span key={chapitre.numero} data-index={i}>
              {chapitre.numero}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
