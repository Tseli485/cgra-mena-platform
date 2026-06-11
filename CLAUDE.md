# Plateforme MENA Tuteur — instructions projet

App offline de gestion de dossiers MENA (tuteurs, Belgique). FR/NL, AES-256, zéro serveur.

## Architecture
- `pwa/index.html` — TOUTE l'app (SPA monolithique voulue : transmissibilité). JS inline en bas.
- `pwa/js/data/*.json` + `pwa/data/*.json` — contenu bilingue `{fr,nl}` (guide 14 modules, 23 cas, intervenants, justices de paix, conseil).
- `pwa/js/bergamot-worker.js` + `pwa/models/bergamot/` — traduction neuronale locale NL↔FR (pivot EN). Modèles EXCLUS de l'exe (CI les retire ; fetch depuis le site public, CORS *).
- `pwa/sw.js` — cache `mena-vN` : INCRÉMENTER à chaque modif de pwa/ sinon les clients servent l'ancien code.
- `server.py` → exe PyInstaller (CI 3 OS).

## Règles critiques
1. JAMAIS de données réelles de mineur dans le dépôt (CI le vérifie et échoue).
2. Textes juridiques : vérifier sur source officielle, dater (`DATA_VERIFIED`), citer la base légale. Réforme RF = loi 18/07/2025 (6 mois).
3. Tout texte UI/donnée = bilingue `{fr,nl}` ; tester les 2 langues (fuite FR↔NL = bug).
4. Dates : `addDays` est en heure LOCALE (bug UTC corrigé) — ne pas réintroduire `toISOString`.
5. Édits de `index.html` : scripts python à ancres exactes + `node --check` sur le JS extrait avant commit.

## Workflow de release
test 10/10 (`pwa/tests.html`) → bump `APP_VERSION` + `pwa/version.json` + `sw.js` → commit → `git subtree split --prefix pwa -b gh-pages && push -f` → tag `vX.Y.Z` → CI publie release 3 OS + SHA256 + soumission winget auto.

## Vérification locale
`python -m http.server 8766 --directory pwa` puis tests.html (Playwright dispo). Manuels : régénérer captures via le script `shoot_all.py [fr|nl]` (historique git) + PDFs Playwright.
