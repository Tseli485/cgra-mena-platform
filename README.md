# 🛡️ Plateforme MENA Tuteur

**Application sécurisée de gestion de dossiers de mineurs étrangers non accompagnés (MENA) pour tuteurs en Belgique.**
Bilingue FR/NL · chiffrée (AES-256) · 100 % hors ligne · gratuite.

## 🚀 Ouvrir l'application

### 🌐 Lien direct (recommandé)
**https://tseli485.github.io/cgra-mena-platform/**

![QR code de l'application](docs/img/qr-app.png)

### 💻 Application de bureau (Windows / macOS / Linux)
Téléchargez l'exécutable depuis la **[dernière release](https://github.com/Tseli485/cgra-mena-platform/releases/latest)** — aucune installation, double-clic et l'app s'ouvre dans le navigateur. Vérifiez l'intégrité avec `SHA256SUMS.txt`.

### 📱 Installer sur l'écran d'accueil
Ouvrez le lien ci-dessus puis menu du navigateur → « Installer l'application ». Fonctionne ensuite hors ligne.

📄 Un dépliant d'une page à distribuer aux tuteurs : [docs/Depliant-MENA-Tuteur.pdf](docs/Depliant-MENA-Tuteur.pdf)

## ✨ Fonctionnalités
- 📄 **Import d'une fiche DVZ (PDF)** : dossier créé automatiquement (texte + photo, via pdf.js, hors ligne)
- 🌐 **Traduction NL ↔ FR** des documents officiels (en mode FR, la fiche s'affiche intégralement en français)
- ⚖️ **Juge de paix compétent** par code postal (base nationale vérifiée) + rapports obligatoires avec échéances calculées
- 🏦 **Suivi bancaire** + relevé PDF pour le juge de paix
- 📚 Législation & délais, 16 cas pratiques, assistant conseil par pays d'origine, 59+ ressources belges
- 💾 **Sauvegarde / transfert chiffré** entre tuteurs (`.menabackup`)
- 🔒 Mot de passe + **verrouillage automatique** (10 min) + données chiffrées AES-256 **uniquement sur l'appareil**

## 🔐 Confidentialité
Aucune donnée de mineur ne quitte l'appareil : chiffrement côté navigateur, pas de serveur, pas de compte en ligne. Le code est public ; les données ne le sont jamais.

## 🛠️ Développement
- App : `pwa/` (SPA autonome, service worker, données JSON bilingues)
- Lanceur local : `python server.py` ou `Lancer-MENA-Tuteur.bat`
- Tests : ouvrir `pwa/tests.html` via le serveur local
- CI : validation JSON + versions + détection de données réelles ; build 3 OS + release automatique sur tag `v*` ; veille mensuelle des liens officiels
