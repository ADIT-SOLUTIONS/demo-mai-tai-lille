# Maï-Taï Lille, démo de site (`demo-mai-tai-lille`)

Démo proactive en deux versions pour Maï-Taï, bar à tapas thaïlandaises et cocktails au 24 rue Royale à Lille (prospect). Terminée le 2026-09-17 et en ligne. Première démo de la série : FADA, Amor Amor et Gigi reprennent ses solutions de fluidité 3D.

## Contexte AD IT Solutions
- Prospect : Maï-Taï (slug `mai-tai-lille`). Fiche : Drive ADIT Operations, `02-prospects/mai-tai-lille/CLAUDE.md` (aucun autre fichier dans le dossier au 2026-10-26). Faits sourcés : `sources/info.txt` (article actu.fr du 28/08/2026) et compte Instagram @maitailille.
- Drive ADIT Operations : `G:\Shared drives\ADIT Operations` chez Jules (Windows), `~/Library/CloudStorage/GoogleDrive-<adresse>/Shared drives/ADIT Operations` chez Achille (Mac).
- Clone local : `C:\dev\demo-mai-tai-lille` chez Jules, `~/dev/demo-mai-tai-lille` chez Achille.
- Méthode : skill `adit:demo-prospect` (démo en deux versions) et `adit:site-vitrine`.

## Stack et commandes
- Vite 8, React 19, TypeScript 5.9, GSAP 3 (`@gsap/react`), Three.js 0.186, polices Fontsource (Big Shoulders Display, DM Sans).
- `npm ci`, `npm run dev` (configuration `.claude/launch.json` : port 5183), `npm run build` (tsc puis vite), `npm run preview`.
- Sortie `dist/` avec trois pages : `/` (démo), `/v1/`, `/v2/`. Entrées déclarées dans `vite.config.ts`.
- `node scripts/generer-feuilles.mjs src-v2/data/feuilles.ts` régénère les tracés SVG des feuilles tropicales.
- Pas de `.node-version` ni de `render.yaml` : le service Render est réglé à la main.

## Branches et déploiement
- `demo-versions` (par défaut) : page de démo qui bascule entre v1 et v2.
- `main` : version 1 classique seule, « jungle de nuit » (9c6b0d5).
- Pistes d'effets du 2026-09-17, une par branche : `refonte-effets-3d` (proposition 1, allumage du néon), `maitai-se-compose` (proposition 2 en SVG), `maitai-3d` (proposition 2 en Three.js réaliste), `profondeur-jungle` (proposition 3).
- Render : service statique `mai-tai-lille`, branche `demo-versions`, build `npm ci --include=dev && npm run build`, publié `dist`, https://mai-tai-lille.onrender.com (répond 200 le 2026-10-26).
- ATTENTION : chaque commit poussé sur `demo-versions` est mis en ligne automatiquement.
- Render affiche déjà le dépôt `ADIT-SOLUTIONS/demo-mai-tai-lille` ; la fiche et la carte des dépôts le disent encore relié à l'ancien dépôt [À CONFIRMER].

## Structure du code
- `index.html` et `selecteur/` (`selecteur.ts`, `cadre.ts`, `protocole.ts`, `selecteur.css`) : page de démo. Deux cadres plein écran superposés, soleil qui s'allume pendant le chargement, pastille en bas à gauche, `/#2` ouvre la v2.
- `selecteur/cadre.ts`, chargé par chaque version : préchargement, progression envoyée à la démo, retour en haut, version cachée ou visible.
- `v1/index.html` pour `src/` (classique) ; `v2/index.html` pour `src-v2/` (immersive : `profondeur-jungle` et le cocktail 3D de `maitai-3d`).
- Données : `src/data/infos.ts` (adresse, contact, réseaux, horaires, tapas, cocktails, boissons). `src-v2/data/infos.ts` en est une copie identique : toute correction se fait dans les deux fichiers.
- Scène 3D du cocktail : `src-v2/components/Composition.tsx` et `src-v2/components/cocktail/` (`scene3d.ts`, `sequence.ts`, `shaders.ts`, `textures.ts`, `environnement.ts`). Image de repli : `public/images/maitai-3d.webp`.
- Images WebP communes : `public/images/` ; photos d'origine : `sources/`. Documentation : `docs/demo-versions.md`, `docs/propositions-effets.md`.

## Décisions et points d'attention
- V2 retenue pour la démo : proposition 3 « Profondeur jungle », avec la séquence 3D du Maï Taï à la place de l'encart « Cocktail signature ». `docs/propositions-effets.md` marque pourtant la proposition 1 comme « retenue » [À CONFIRMER]. Proposition 4 (néon en vraie 3D) non réalisée.
- Fluidité 3D : scène préparée dès l'ouverture, aucun rendu quand la version est cachée (classe `cadre-masque`), scène et compteur calés sur le temps de la timeline (correctif à reporter sur `maitai-3d` si besoin).
- Règles communes : texte dans le HTML, version statique si « réduire les animations », version mobile pensée à part.
- Placeholders : prix en `[PRIX]` sauf le Maï Taï à 12 € (article), `[TELEPHONE]`, `[EMAIL]`, `[NUMERO_WHATSAPP]`, `[DOMAINE]`, `[FORMSPREE_ID]`. Pas de dosages (inconnus). Horaires sans source indiquée [À CONFIRMER].
- Glaçons de la scène 3D à valider avec les gérants. Mention Loi Evin déjà dans le pied de page.
- Pages en `noindex` : à retirer pour un site définitif. Ne jamais ajouter de réécriture de toutes les adresses vers `/index.html`.
- Dépôt public, droits sur les photos et le logo non réglés : ne pas présenter la démo comme une réalisation.

## Règles AD IT Solutions
- Diagnostic avant action : répondre aux questions sans modifier le code, attendre le feu vert avant d'implémenter.
- Textes : jamais de tiret cadratin « — », pas de tournures « trop IA », aucune donnée inventée (placeholder `[À COMPLÉTER : …]`).
- Aucun secret dans le dépôt.
- Fin de travail : résumé court (fait, placeholders restants, à vérifier) et mise à jour de ce fichier si une décision change.
