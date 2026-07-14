# Déploiement Vercel + Supabase

## Architecture retenue

- Les dossiers MENA, pièces jointes, rendez-vous privés et notes de suivi restent chiffrés en AES-256 sur l'appareil du tuteur.
- Supabase fournit uniquement des contenus publics vérifiés : sources, documents officiels, mises à jour juridiques, annuaire de ressources et formations publiées.
- La clé intégrée au navigateur est une clé **publishable**. Les politiques RLS du projet `CGRA` limitent l'accès anonyme aux tables publiques en lecture seule.
- Aucune clé `service_role`, aucune donnée nominative et aucun dossier de mineur ne doivent être ajoutés au dépôt ou envoyés par le navigateur.

## Prévisualisation locale

```bash
python3 -m http.server 8766 --directory pwa
```

Ouvrir ensuite `http://localhost:8766` dans Chrome. Le protocole HTTP local est nécessaire pour Web Crypto et le service worker.

## Vérification

```bash
node scripts/verify-release.mjs
```

Le contrôle valide notamment la cohérence de version, les scripts, le cache hors ligne, le contrat de confidentialité, le flux rendez-vous et la configuration Vercel.

## Déploiement

Le fichier `vercel.json` publie le répertoire `pwa` et applique les principaux en-têtes de sécurité. Créer d'abord une prévisualisation Vercel, exécuter les scénarios manuels ci-dessous, puis promouvoir cette même version en production après approbation.

1. Créer un mot de passe de test et un dossier entièrement fictif.
2. Vérifier la navigation FR/NL et le fonctionnement hors ligne.
3. Créer un rendez-vous, ouvrir l'itinéraire et l'ajout Google Calendar.
4. Transformer le rendez-vous en note de suivi et vérifier la relance au tableau de bord.
5. Contrôler la synchronisation des contenus publics et son repli sur le cache hors ligne.
6. Supprimer toutes les données fictives avant la validation finale.
