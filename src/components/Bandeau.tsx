const MOTS = ['Tapas thaïes', 'Cocktails', 'Pressions locales', 'Singha', 'Rue Royale', 'Vieux-Lille']

export default function Bandeau() {
  return (
    <div className="bandeau" aria-hidden="true">
      <div className="bandeau__piste">
        {Array.from({ length: 2 }).map((_, i) => (
          <span key={i} className="bandeau__groupe">
            {MOTS.map((mot) => (
              <span key={mot}>{mot}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}
