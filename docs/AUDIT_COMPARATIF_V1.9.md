# Audit comparatif — site GitHub Pages vers MENA Tuteur 1.9

Date de l'audit : 14 juillet 2026  
Source examinée : `https://tseli485.github.io/cgra-mena-platform/` (version affichée 1.7.15)

## Constat source

Le site public source présente neuf espaces : Tableau de bord, Mes Dossiers, Cycle de Vie, Législation & Délais, Assistant Conseil, Cas Pratiques, Guide du tuteur, Ressources et Agenda & Interprètes.

Les onglets « Documents Pro » et « Automatisations » mentionnés dans la demande ne sont pas présents dans la navigation ni dans le code de la version 1.7.15. Certaines fonctions proches existent à l'intérieur des dossiers (rapports, analyse de document, frais, échéances), mais elles sont dispersées.

## Écarts identifiés et traitement

| Domaine | Manque dans la source 1.7.15 | Traitement dans la version 1.9 |
|---|---|---|
| Documents professionnels | Aucun centre unique de création | Nouvel onglet « Documents Pro » |
| Modèles | Rapports accessibles seulement depuis le détail d'un dossier | 10 modèles centralisés et préremplis |
| Réutilisation des données | Saisie répétitive du tuteur et du jeune | Profil et dossier injectés automatiquement |
| Vérification avant envoi | Génération directe, peu de place pour relire | Éditeur intégral avant impression, copie ou e-mail |
| Traçabilité | Pas d'historique commun des documents produits | Historique chiffré enregistré dans chaque dossier |
| Rapports de tutelle | Fonctions réparties dans plusieurs accordéons | Rapport initial, périodique et final au même endroit |
| Coordination | Pas de modèles transversaux centralisés | Avocat, interprète, école, santé, famille et transmission |
| Automatisations | Calculs et alertes dispersés | Nouvel onglet « Automatisations » et moteur de règles local |
| Rendez-vous | Suivi manuel de l'agenda | Détection des rendez-vous des 7 prochains jours |
| Rapports obligatoires | Lecture manuelle des échéances | Retard et échéance sous 14 jours détectés |
| Passage à 18 ans | Informations dans le guide uniquement | Rappel dès 16 ans et demi, puis alerte à trois mois |
| Documents expirants | Pas de contrôle transversal | Règle de renouvellement à 60 jours si une date est enregistrée |
| Sauvegarde | Bannière périodique isolée | Règle dédiée lorsque la sauvegarde dépasse 30 jours |
| Confidentialité | Données locales déjà chiffrées | Nouvelles données intégrées au même coffre AES local |
| Installation | Approche surtout Windows | Installation PWA indépendante sur ordinateur, Android et iOS |
| Contenu officiel | Données embarquées seulement | Synchronisation Supabase en lecture seule avec cache hors ligne |
| Rendez-vous externes | Liens génériques | Google Calendar et Google Maps sans nom du mineur dans le lien |
| Notes après rendez-vous | Pas de conversion structurée | Note de suivi chiffrée et relance dans le dossier |

## Modèles Documents Pro ajoutés

1. Rapport initial au Service des Tutelles.
2. Rapport périodique de suivi.
3. Rapport final de tutelle.
4. Note de synthèse pour l'avocat.
5. Demande d'interprète.
6. Autorisation du représentant légal.
7. Courrier à l'établissement scolaire.
8. Demande de suivi médical ou psychologique.
9. Demande de recherche familiale.
10. Bordereau de transmission de dossier.

## Règles d'automatisation ajoutées

1. Rendez-vous prévu dans les sept jours.
2. Rapport en retard ou attendu sous quatorze jours.
3. Préparation de la transition à partir de 16 ans et 6 mois.
4. Alerte de fin de tutelle dans les trois mois précédant 18 ans.
5. Renouvellement d'un titre de séjour ou document d'identité à soixante jours.
6. Sauvegarde chiffrée absente ou vieille de plus de trente jours.

## Limites assumées

- Les automatisations sont locales : elles s'exécutent à l'ouverture et ne transmettent aucune donnée.
- Un navigateur fermé ne peut pas envoyer de rappels serveur. Cette contrainte protège l'architecture indépendante demandée pour chaque tuteur.
- Les modèles aident à structurer le travail mais ne remplacent pas la vérification professionnelle, juridique ou médicale du contenu avant envoi.
- Les données nominatives restent sur l'appareil ; Supabase ne fournit que les contenus publics.

## Validation attendue

- Chaque onglet s'ouvre sur ordinateur, tablette et téléphone.
- Les modèles refusent de produire un document sans dossier sélectionné.
- Un document enregistré réapparaît dans l'historique chiffré du dossier.
- Une même règle ne crée pas deux rappels identiques.
- Les rappels traités disparaissent de la liste active.
- Le site reste installable et utilisable hors connexion après chargement initial.
