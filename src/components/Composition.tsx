import { useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SIGNATURE } from '../data/infos'

gsap.registerPlugin(ScrollTrigger, useGSAP)
ScrollTrigger.config({ ignoreMobileResize: true })

/*
  « Le Maï Taï se compose » : le verre se remplit au scroll, dans l'ordre de la recette.
  Géométrie du verre dans le repère SVG (viewBox 0 -100 300 540) :
  intérieur de 60→240 en haut (y 50) à 73→227 au fond (y 392), base épaisse jusqu'à y 432.
  Les couleurs sont des teintes d'illustration, aucun dosage n'est représenté.
*/

const VB_Y = -100
const VB_H = 540
const FOND = 392
const NIVEAU_FINAL = 82
const EPAISSEUR = (FOND - NIVEAU_FINAL) / SIGNATURE.ingredients.length

const murInterieur = (y: number) => 240 - ((y - 50) * 13) / 342
const murExterieur = (y: number) => 252 - ((y - 38) * 16) / 382

const COULEURS: Record<string, string> = {
  'Rhum ambré': '#a9571c',
  'Rhum blanc': 'rgba(228, 240, 234, 0.26)',
  Whisky: '#c98a33',
  'Triple sec': 'rgba(255, 196, 120, 0.42)',
  'Citron vert': '#c4d96f',
  Ananas: '#f3cd57',
  Orange: '#f29a2e',
  Cranberry: '#c13349',
  Grenadine: '#9c0f2d',
  'Sucre de canne': 'rgba(255, 238, 205, 0.36)',
}

const INDEX_GRENADINE = SIGNATURE.ingredients.indexOf('Grenadine')

const couches = SIGNATURE.ingredients.map((nom, i) => {
  const haut = FOND - (i + 1) * EPAISSEUR
  const milieu = haut + EPAISSEUR / 2
  return {
    nom,
    numero: String(i + 1).padStart(2, '0'),
    couleur: COULEURS[nom] ?? '#e0782a',
    haut,
    // position de l'étiquette en % de la boîte du verre
    x: ((murExterieur(milieu) + 3) / 300) * 100,
    y: ((milieu - VB_Y) / VB_H) * 100,
  }
})

// Repères de la timeline (unités arbitraires réparties sur la distance de scroll)
const T0 = 0.35
const PAS = 0.62
const VERSER = 0.42
const debut = (i: number) => T0 + i * PAS
const T_MELANGE = debut(couches.length) + 0.1
const T_FINALE = T_MELANGE + 0.8

const NOM = 'Maï Taï'

const BULLES = [
  { x: 96, r: 2.2, d: 3.6, delai: 0 },
  { x: 118, r: 1.4, d: 4.4, delai: 1.2 },
  { x: 142, r: 2.6, d: 3.2, delai: 2.1 },
  { x: 163, r: 1.6, d: 4.8, delai: 0.6 },
  { x: 181, r: 2, d: 3.9, delai: 1.8 },
  { x: 204, r: 1.3, d: 4.2, delai: 2.8 },
  { x: 130, r: 1.8, d: 5, delai: 3.3 },
  { x: 190, r: 2.4, d: 3.4, delai: 3.9 },
]

export default function Composition() {
  const racine = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          anime: '(prefers-reduced-motion: no-preference) and (min-height: 560px)',
          mobile: '(max-width: 760px)',
        },
        (contexte) => {
          const { anime, mobile } = contexte.conditions as { anime: boolean; mobile: boolean }
          const bloc = racine.current
          if (!anime || !bloc) return

          bloc.classList.add('composition--anime')
          const q = gsap.utils.selector(bloc)
          const scene = q('.composition__scene')[0]
          const rects = q('.cm-couche')
          const etiquettes = q('.etiquette')
          const flux = q('.cm-flux')[0]
          const niveau = q('.cm-niveau')[0]
          const surface = q('.cm-surface')[0]
          const compteur = q('.composition__compteur-valeur')[0]

          gsap.set(niveau, { attr: { y: FOND } })
          rects.forEach((rect, i) => gsap.set(rect, { attr: { y: couches[i].haut + EPAISSEUR, height: 0 } }))
          gsap.set(surface, { attr: { cy: FOND, rx: murInterieur(FOND) - 150 } })

          const tl = gsap.timeline({
            defaults: { ease: 'none', immediateRender: false },
            scrollTrigger: {
              trigger: scene,
              start: 'top top',
              end: () => `+=${window.innerHeight * (mobile ? 2 : 2.5)}`,
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: () => {
                const t = tl.time()
                const verses = t < T0 + 0.08 ? 0 : Math.min(couches.length, Math.floor((t - T0 - 0.08) / PAS) + 1)
                compteur.textContent = String(verses).padStart(2, '0')
              },
            },
          })

          tl.to(q('.composition__indice'), { autoAlpha: 0, duration: 0.3 }, 0)
          tl.fromTo(q('.composition__lueur'), { opacity: 0.25 }, { opacity: 1, duration: T_MELANGE }, 0)

          // 1. Les dix ingrédients, versés un par un
          couches.forEach((couche, i) => {
            const s = debut(i)
            tl.set(flux, { attr: { fill: couche.couleur } }, s)
            tl.fromTo(flux, { opacity: 1, attr: { height: 0 } }, { attr: { height: couche.haut - VB_Y }, duration: 0.12 }, s)
            tl.to(rects[i], { attr: { y: couche.haut, height: EPAISSEUR + 0.6 }, duration: VERSER, ease: 'power1.out' }, s + 0.08)
            tl.to(niveau, { attr: { y: couche.haut }, duration: VERSER, ease: 'power1.out' }, s + 0.08)
            tl.to(
              surface,
              { opacity: 1, attr: { cy: couche.haut, rx: murInterieur(couche.haut) - 150 }, duration: VERSER, ease: 'power1.out' },
              s + 0.08,
            )
            tl.to(flux, { opacity: 0, duration: 0.1 }, s + VERSER)

            const etiquette = etiquettes[i]
            if (mobile) {
              tl.fromTo(etiquette, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.22 }, s + 0.12)
              tl.to(etiquette, { autoAlpha: 0, y: -12, duration: 0.18 }, i < couches.length - 1 ? debut(i + 1) : T_MELANGE)
            } else {
              tl.fromTo(etiquette, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.3 }, s + 0.14)
              tl.fromTo(etiquette.querySelector('.etiquette__trait'), { scaleX: 0 }, { scaleX: 1, duration: 0.3 }, s + 0.08)
              tl.to(etiquette, { opacity: 0.4, duration: 0.2 }, i < couches.length - 1 ? debut(i + 1) + 0.14 : T_MELANGE)
            }

            if (i === 2) tl.fromTo(q('.cm-bulles'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, s)

            // La grenadine descend au fond en dégradé
            if (i === INDEX_GRENADINE) {
              tl.to(rects[i], { attr: { fill: COULEURS.Orange }, duration: 0.35 }, s + VERSER + 0.04)
              tl.fromTo(q('.cm-soleil-levant'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, s + VERSER + 0.04)
            }
          })

          // 2. Le mélange
          tl.to(rects, { opacity: 0, duration: 0.6 }, T_MELANGE)
          tl.to(q('.cm-soleil-levant'), { opacity: 0, duration: 0.6 }, T_MELANGE)
          tl.fromTo(q('.cm-melange'), { opacity: 0 }, { opacity: 1, duration: 0.6 }, T_MELANGE)

          // 3. Garniture, nom en néon, prix
          // Transformations SVG passées par l'attribut `transform` (pas de compensation d'origine CSS)
          tl.fromTo(
            q('.cm-ananas'),
            { autoAlpha: 0, attr: { transform: 'translate(0 -70) rotate(-25 238 20)' } },
            { autoAlpha: 1, attr: { transform: 'translate(0 0) rotate(0 238 20)' }, duration: 0.45, ease: 'power2.out' },
            T_FINALE,
          )
          tl.fromTo(
            q('.cm-paille'),
            { autoAlpha: 0, attr: { transform: 'translate(0 -90)' } },
            { autoAlpha: 1, attr: { transform: 'translate(0 0)' }, duration: 0.45, ease: 'power2.out' },
            T_FINALE + 0.1,
          )
          tl.to(q('.composition__compteur'), { autoAlpha: 0, duration: 0.25 }, T_FINALE)
          tl.fromTo(q('.cm-lettre'), { '--a': 0 }, { '--a': 1, duration: 0.25, stagger: 0.07, ease: 'power1.in' }, T_FINALE + 0.1)
          tl.fromTo(
            q('.composition__prix, .composition__phrase, .composition__fin-mobile'),
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' },
            T_FINALE + 0.45,
          )
          tl.to({}, { duration: 0.5 })

          // Le verre pivote doucement pendant toute la séquence, le reflet suit
          tl.fromTo(q('.composition__rotation'), { rotateY: -16 }, { rotateY: 12, duration: tl.duration() }, 0)
          tl.fromTo(
            q('.cm-reflets'),
            { attr: { transform: 'translate(-5 0)' } },
            { attr: { transform: 'translate(7 0)' }, duration: tl.duration() },
            0,
          )
          tl.fromTo(q('.composition__ombre'), { scaleX: 0.9, x: 10 }, { scaleX: 1.05, x: -8, duration: tl.duration() }, 0)

          document.fonts?.ready.then(() => ScrollTrigger.refresh())

          return () => bloc.classList.remove('composition--anime')
        },
      )
    },
    { scope: racine },
  )

  return (
    <div className="composition" ref={racine}>
      <div className="composition__scene">
        <div className="container composition__grille">
          <div className="composition__texte">
            <p className="surtitre">Cocktail signature</p>
            <h3 className="composition__nom">
              <span className="sr-only">{NOM}</span>
              <span aria-hidden="true">
                {Array.from(NOM).map((lettre, i) => (
                  <span key={i} className="cm-lettre">
                    {lettre}
                  </span>
                ))}
              </span>
            </h3>
            <div className="composition__etat">
              <p className="composition__compteur" aria-hidden="true">
                <span className="composition__compteur-valeur">00</span> / {couches.length} ingrédients
              </p>
              <p className="composition__prix">{SIGNATURE.prix}</p>
            </div>
            <p className="composition__phrase">
              Celui qui a donné son nom au bar. Steven a appris à le préparer lors d'un voyage en Thaïlande et le sert
              aujourd'hui rue Royale.
            </p>
            <ul className="ingredients composition__liste" aria-label="Ingrédients">
              {SIGNATURE.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
            <p className="composition__indice" aria-hidden="true">
              Faites défiler pour composer le cocktail
            </p>
          </div>

          <div className="composition__plateau">
            <div className="composition__lueur" aria-hidden="true" />
            <div className="composition__verre">
              <div className="composition__rotation">
                <VerreSvg />
              </div>
              <div className="composition__ombre" aria-hidden="true" />
              <ol className="composition__etiquettes" aria-hidden="true">
                {couches.map((couche) => (
                  <li
                    key={couche.nom}
                    className="etiquette"
                    style={{ '--x': couche.x, '--y': couche.y, '--couleur': couche.couleur } as CSSProperties}
                  >
                    <span className="etiquette__trait" />
                    <span className="etiquette__numero">{couche.numero}</span>
                    <span className="etiquette__nom">{couche.nom}</span>
                  </li>
                ))}
              </ol>
              <p className="composition__fin-mobile" aria-hidden="true">
                Appris par Steven lors d'un voyage en Thaïlande.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VerreSvg() {
  const interieur = 'M60 50 L240 50 L227 392 L73 392 Z'
  return (
    <svg className="cm-svg" viewBox={`0 ${VB_Y} 300 ${VB_H}`} role="img" aria-label="Verre de Maï Taï">
      <defs>
        <clipPath id="cm-interieur">
          <path d={interieur} />
        </clipPath>
        <clipPath id="cm-clip-niveau">
          <rect className="cm-niveau" x="0" y={NIVEAU_FINAL} width="300" height="400" />
        </clipPath>
        <linearGradient id="cm-verre" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e6fff0" stopOpacity="0.2" />
          <stop offset="0.09" stopColor="#e6fff0" stopOpacity="0.05" />
          <stop offset="0.5" stopColor="#e6fff0" stopOpacity="0.02" />
          <stop offset="0.9" stopColor="#e6fff0" stopOpacity="0.06" />
          <stop offset="1" stopColor="#e6fff0" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="cm-reflet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.25" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.8" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cm-degrade-melange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3ab45" />
          <stop offset="0.55" stopColor="#e5722b" />
          <stop offset="1" stopColor="#a8231f" />
        </linearGradient>
        <linearGradient id="cm-degrade-grenadine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stopColor="#9c0f2d" stopOpacity="0" />
          <stop offset="1" stopColor="#9c0f2d" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Filet versé depuis le haut */}
      <rect className="cm-flux" x="147" y={VB_Y} width="6" height="0" rx="3" />

      {/* Liquide */}
      <g clipPath="url(#cm-interieur)">
        <rect x="50" y="50" width="200" height="342" className="cm-fond-verre" />
        {couches.map((couche) => (
          <rect
            key={couche.nom}
            className="cm-couche"
            x="50"
            y={couche.haut}
            width="200"
            height={EPAISSEUR + 0.6}
            fill={couche.couleur}
          />
        ))}
        <rect className="cm-soleil-levant" x="50" y={NIVEAU_FINAL} width="200" height={FOND - NIVEAU_FINAL} fill="url(#cm-degrade-grenadine)" />
        <rect className="cm-melange" x="50" y={NIVEAU_FINAL} width="200" height={FOND - NIVEAU_FINAL} fill="url(#cm-degrade-melange)" />
        <g clipPath="url(#cm-clip-niveau)">
          <g className="cm-bulles">
            {BULLES.map((b, i) => (
              <circle
                key={i}
                className="cm-bulle"
                cx={b.x}
                cy="384"
                r={b.r}
                style={{ animationDuration: `${b.d}s`, animationDelay: `${b.delai}s` } as CSSProperties}
              />
            ))}
          </g>
        </g>
        <ellipse className="cm-surface" cx="150" cy={NIVEAU_FINAL} rx={murInterieur(NIVEAU_FINAL) - 150} ry="6" />
      </g>

      {/* Paille en bambou */}
      <g className="cm-paille" transform="translate(0 0)">
        <line x1="121" y1="330" x2="92" y2="-78" />
        <line className="cm-paille__noeud" x1="99" y1="-5" x2="111" y2="-6" />
        <line className="cm-paille__noeud" x1="95" y1="-48" x2="106" y2="-49" />
      </g>

      {/* Verre */}
      <path className="cm-base" d="M73 392 L227 392 L236 420 Q235 430 224 430 L76 430 Q65 430 64 420 Z" />
      <path className="cm-corps" d="M47 36 L253 36 L237 420 Q236 432 224 432 L76 432 Q64 432 63 420 Z" />
      <path className="cm-paroi" d={interieur} />
      <ellipse className="cm-bord" cx="150" cy="37" rx="103" ry="7" />
      <g className="cm-reflets" transform="translate(0 0)">
        <path d="M70 62 L81 62 L87 382 L79 382 Z" fill="url(#cm-reflet)" opacity="0.55" />
        <path d="M222 70 L226 70 L217 372 L214 372 Z" fill="url(#cm-reflet)" opacity="0.3" />
      </g>

      {/* Tranche d'ananas posée sur le bord */}
      <g className="cm-ananas" transform="translate(0 0) rotate(0 238 20)">
        <path className="cm-ananas__chair" d="M236 46 L196 -6 A62 62 0 0 1 286 14 Z" />
        <path className="cm-ananas__ecorce" d="M196 -6 A62 62 0 0 1 286 14" />
        <path className="cm-ananas__fibres" d="M236 46 L214 2 M236 46 L236 -4 M236 46 L256 0 M236 46 L272 8" />
      </g>
    </svg>
  )
}
