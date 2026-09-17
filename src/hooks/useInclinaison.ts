import { useEffect } from 'react'

/**
 * Petit relief 3D : les éléments [data-inclinaison] s'inclinent selon la position du pointeur
 * (souris uniquement, et seulement si les animations ne sont pas réduites).
 */
export function useInclinaison(angleMax = 6) {
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    if (!mq.matches) return

    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-inclinaison]'))
    const nettoyages = elements.map((el) => {
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        el.style.setProperty('--ry', `${((px - 0.5) * 2 * angleMax).toFixed(2)}deg`)
        el.style.setProperty('--rx', `${((0.5 - py) * 2 * angleMax).toFixed(2)}deg`)
        el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
        el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
        el.classList.add('is-incline')
      }
      const onLeave = () => {
        el.style.setProperty('--rx', '0deg')
        el.style.setProperty('--ry', '0deg')
        el.classList.remove('is-incline')
      }
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    })
    return () => nettoyages.forEach((n) => n())
  }, [angleMax])
}
