# Journal de développement — LocalisationDAB

---

## Session du 2026-04-24

### Contexte
Préparation de la version de production avant déploiement final.
Stack : Node.js + Express + PostgreSQL (Render) / React + Vite (Vercel).

---

### Réalisations

#### 1. Identité visuelle — Logo
- Création d'un logo via **Canva AI** (4 candidats générés) pour l'app renommée **"localiseMyDab"**
- Fichier source : `Logos/Logo - ATM locator.png` (1313×1313px)
- Rognage automatique du blanc autour du logo via **jimp** → `frontend/public/logo.png` (1233×957px)
- Remplacement de l'emoji 💳 dans la Navbar par le vrai logo PNG
- Favicon `index.html` mis à jour pour pointer vers `/logo.png`
- Taille finale dans la Navbar : `h-14` (56px) pour une bonne lisibilité mobile

#### 2. Écran de démarrage (Splash Screen)
- Création du composant `frontend/src/components/UI/SplashScreen.jsx`
- Affichage du logo en plein écran pendant **3 secondes** à l'ouverture de l'app
- Fondu de disparition progressif (600ms) à partir de 2.4s
- **Logique 24h** : le splash ne s'affiche qu'**une seule fois par tranche de 24h** par utilisateur via `localStorage` (`splash_last_shown`)
- Intégration dans `App.jsx` avant le BrowserRouter

#### 3. Marker de position utilisateur sur la carte
- Remplacement du bonhomme rouge SVG (`USER_ICON` dans `MapView.jsx`) par l'ours du logo
- Première version : logo complet `/logo.png` (52×52px)
- Deuxième version : logo rogné à 65% de hauteur pour supprimer le texte
- Version finale : fichier `Logos/logo_carte.png` (858×754px) fourni par l'utilisateur — ours sans texte, sans rognage → `frontend/public/bear-marker.png`
- Taille du marker : **72×72px** avec pointe indicatrice en dessous

#### 4. Infrastructure / Déploiement
- Discussion sur la configuration serveur recommandée pour la production :
  - **Hetzner CX32** (4 vCPU / 8GB RAM / 80GB SSD) à ~8€/mois
  - Architecture : Vercel (frontend) + VPS avec nginx + PM2 + PostgreSQL
- Tous les changements buildés et pushés sur **GitHub → Render + Vercel** (déploiement automatique)

---

### Commits du jour
| Hash | Description |
|------|-------------|
| `dd37ae2` | fix(navbar): increase logo size for better mobile visibility |
| `6b68f13` | feat(map): use logo_carte (bear without text) as user position marker |
| `bd0f2bd` | feat(map): enlarge bear marker and use text-free bear image |
| `55c327b` | feat(map): replace red stick figure with bear logo as user position marker |
| `3938b48` | feat(ui): add logo and splash screen |

---

### Fichiers créés / modifiés
| Fichier | Action |
|---------|--------|
| `frontend/public/logo.png` | Créé — logo principal rogné |
| `frontend/public/bear-marker.png` | Créé — ours sans texte pour marker carte |
| `frontend/src/components/UI/SplashScreen.jsx` | Créé |
| `frontend/src/components/UI/Navbar.jsx` | Modifié — logo PNG + taille |
| `frontend/src/App.jsx` | Modifié — intégration SplashScreen + logique 24h |
| `frontend/src/components/Map/MapView.jsx` | Modifié — USER_ICON remplacé par ours |
| `frontend/index.html` | Modifié — favicon mis à jour |

---

### Points en suspens
- [ ] Taille de l'ours sur la carte à valider visuellement sur mobile
- [ ] Tests unitaires backend (Phase 3)
- [ ] Import Google Places initial (vérifier clé API)
- [ ] README.md final

---

*Rédigé le 2026-04-24 — Session Claude Code*
