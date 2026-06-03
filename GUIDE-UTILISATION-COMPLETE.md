# 📖 Guide Complet d'Utilisation & Test

## 🌐 ACCÈS À LA PLATEFORME

### 1️⃣ Ouvrir le site
```
Va à: https://cgra-mena-platform.netlify.app
```

Tu devrais voir:
- **Accueil** avec menu principal
- **8 Modules** disponibles
- **Recherche globale** en haut
- **Offline indicator** (si tu es offline)

---

## 🧪 TEST 1: Interface & Navigation (5 min)

### Teste les menus
1. Clique sur **"Lifecycle"** (Cycle de Vie)
   - Tu devrais voir les phases 0-18 ans
   - Essaie de sélectionner une tranche d'âge
   - Clique sur une phase pour voir détails

2. Clique sur **"Cases"** (Études de Cas)
   - Tu devrais voir 15 cas disponibles
   - Essaie les **Filtres**:
     - Par Type (unaccompanied, trauma, etc)
     - Par Âge (0-2, 2-6, 6-12, 12-18)
     - Par Domaine (documents, santé, finances, travail)
   - Clique sur un cas pour voir full story

3. Clique sur **"Resources"** (Ressources)
   - Tu devrais voir 30+ avocats + 50+ organisations
   - Essaie la **Recherche** (tape "avocats asile")
   - Essaie les **Filtres**:
     - Par Type (legal, health, housing, etc)
     - Par Région (Brussels, Flandre, Wallonie)
     - Par Langue (FR, EN, NL)

4. Clique sur **"Search"** (Recherche Globale)
   - Tape une question (ex: "asylum procedure")
   - Tu devrais voir résultats des lifecycle + cases
   - Clique sur résultat pour voir contexte

---

## 📥 TEST 2: Télécharger les PDFs (5 min)

### Ouvre les documents
1. Clique sur **"Documents"** ou cherche "syllabus"
2. Tu devrais voir deux PDFs:
   - **SYLLABUS_COURTE.pdf** (20 pages - quick reference)
   - **SYLLABUS_COMPLETE.pdf** (80 pages - full workbook)

### Télécharge les PDFs
1. Clique sur chaque PDF
2. Ils devraient s'ouvrir dans un nouvel onglet
3. Clique sur **Download** (flèche vers le bas)
4. Fichiers sauvegardés sur ton ordi

### Teste les PDFs localement
1. Ouvre SYLLABUS_COURTE.pdf
   - Regarde la **Table of Contents**
   - Clique sur un lien (hyperlinks devraient marcher)
   - Verifies: 20 pages exactement
   - Essaie d'imprimer (File → Print)

2. Ouvre SYLLABUS_COMPLETE.pdf
   - Même test que ci-dessus
   - Verifies: 80 pages exactement
   - Regarde les images/tables s'il y en a

---

## 💾 TEST 3: Mode Offline (Très Important!) (10 min)

### Tester que l'app fonctionne SANS internet

#### Option A: Sur Desktop (Chrome/Edge)
1. Ouvre DevTools: **F12** ou **Ctrl+Shift+I**
2. Onglet **Network**
3. En bas, tu verras **"Offline"** → clique
4. L'app continue à fonctionner! ✨

**Teste offline:**
- Clique sur **Lifecycle** → fonctionne?
- Clique sur **Cases** → fonctionne?
- Clique sur **Resources** → fonctionne?
- Essaie la **Recherche** → fonctionne?

5. Remets **Online** (clique sur Offline à nouveau)

#### Option B: Sur Mobile
1. Met ton téléphone en **Airplane Mode**
2. Ouvre le site
3. Clique sur **"Install App"** (button en haut)
4. L'app s'installe comme une native app ✨
5. Teste toutes les features sans internet

**C'est la force de la PWA!** Ça marche partout, même sans réseau. 💪

---

## 🎯 TEST 4: Données & Persistence (5 min)

### Test que les données se sauvegardent

1. Ouvre **Lifecycle**
2. Clique sur une phase
3. Coche quelques **items de checklist**
4. **Actualise la page** (F5 ou Ctrl+R)
5. Les checkboxes devraient rester cochées! ✅

Pourquoi? = Les données sont sauvegardées localement dans **IndexedDB** (base de données du navigateur)

### Test les bookmarks (Favoris)

1. Ouvre un **Case**
2. Tu devrais voir un **★ (Star)** icon
3. Clique sur la star
4. Va ailleurs dans l'app
5. Va back sur le même case
6. Le bookmark devrait rester! ✅

---

## 📱 TEST 5: Responsive Design (5 min)

### Test sur mobile (smartphone/tablet)

#### Option A: DevTools Simulation
1. F12 → Outils de développement
2. Clique sur **Toggle Device Toolbar** (Ctrl+Shift+M)
3. Choisir une taille mobile
4. Résize l'écran
5. Teste:
   - La navigation fonctionne-t-elle?
   - Les textes sont lisibles?
   - Les boutons sont cliquables?
   - Les PDFs s'affichent?

#### Option B: Téléphone réel
1. Scan le QR code sur le site OU tape l'URL
2. Teste sur iPhone/Android
3. Essaie d'installer comme app (Add to Home Screen)
4. Utilise comme une vrai app mobile

---

## 🔍 TEST 6: Recherche & Filtres (10 min)

### Test Global Search
1. Tape dans la barre de recherche:
   - "asylum" → devrait trouver lifecycle phases + cases
   - "trauma" → devrait trouver cases spécifiques
   - "avocats" → devrait trouver resources
   - "family" → devrait trouver cases sur famille

### Test Lifecycle Filters
1. Va dans **Lifecycle**
2. Sélectionne une **tranche d'âge**
3. Coche des **obligations** intéressantes
4. Regarde les **ressources suggérées**

### Test Cases Filters
1. Va dans **Cases**
2. Filtre par **Type**: unaccompanied
   - Devrait voir 2-3 cases de ce type
3. Filtre par **Age**: 12-18
   - Devrait voir 4-5 cases
4. Filtre par **Domain**: asylum
   - Devrait voir 5-6 cases

### Test Resources Search
1. Cherche "lawyer" → voir avocats
2. Filtre par **Region**: Brussels
3. Filtre par **Language**: French
4. Combine les filtres!

---

## ✅ TEST 7: Performance (3 min)

### Check Lighthouse Score
1. Ouvre DevTools (F12)
2. Onglet **Lighthouse**
3. Clique sur **Analyze page load**
4. Attends la fin (30 sec)
5. Tu devrais voir **Score > 90** ✨

Vérifies:
- **Performance**: >90
- **Accessibility**: >90
- **Best Practices**: >85
- **SEO**: >90

---

## 🖨️ TEST 8: Impression (3 min)

### Imprimer les PDFs
1. Ouvre un PDF (SYLLABUS_COURTE ou COMPLETE)
2. **Ctrl+P** (ou File → Print)
3. Choisis **imprimante**
4. Paramètres:
   - Oui aux couleurs (si dispo)
   - Marges par défaut
   - Format A4
5. Clique **Print**

### Imprimer depuis l'app
1. Ouvre **Lifecycle**
2. Cherche un bouton **Print** (si visible)
3. Même processus

---

## 🐛 TEST 9: Recherche de Bugs (À Faire!)

### Problèmes à chercher

1. **Broken Links**
   - Clique partout
   - Essaie chaque lien
   - Ils devraient tous marcher

2. **Missing Content**
   - Est-ce que les cases affichent bien?
   - Est-ce que les ressources sont complètes?
   - Est-ce qu'il manque des phases?

3. **UI Issues**
   - Textes qui se chevauchent?
   - Boutons qui ne répondent pas?
   - Images qui ne load pas?

4. **Performance**
   - Le chargement est rapide?
   - Pas de lag/freeze?

### Si tu trouves un bug:
1. Note exactement ce qui se passe
2. Le device/browser
3. Les étapes pour reproduire
4. Dis-moi! Je vais fixer 🔧

---

## 📊 CHECKLIST COMPLÈTE DE TEST

**Marque chaque box quand tu testes:**

- [ ] Navigation: Lifecycle, Cases, Resources, Search
- [ ] PDFs: Télécharge + ouvre + vérifie 20p + 80p
- [ ] Offline mode: Désactive internet, teste tout
- [ ] Mobile responsive: Test sur petit écran
- [ ] Persistence: Coches des items, actualise, c'est là?
- [ ] Bookmarks: Star cases, persist après refresh?
- [ ] Filters: Type, Age, Domain tous fonctionnent?
- [ ] Search: Cherche différents mots-clés
- [ ] Lighthouse: Score > 90?
- [ ] Print: PDFs s'impriment correctement?

---

## 🎯 RÉSUMÉ

**Si tout ça marche:**
✅ **La plateforme est ready for production!**

**Points clés à vérifier:**
1. ✅ Tous les modules accèssibles
2. ✅ Offline mode fonctionne
3. ✅ PDFs téléchargeables & imprimables
4. ✅ Recherche & filtres marche
5. ✅ Pas de bugs évidents
6. ✅ Responsive sur mobile

---

## 🆘 BESOIN D'AIDE?

**Si quelque chose ne fonctionne pas:**
1. Note le **problème exact**
2. Note le **device/browser**
3. Note les **étapes pour reproduire**
4. Dis-moi et je vais fixer! 🔧

**Questions?** Je suis disponible! 💬

---

**MAINTENANT: VA TESTER! 🚀**

Commence par TEST 1 (navigation) et descends jusqu'à TEST 9.
