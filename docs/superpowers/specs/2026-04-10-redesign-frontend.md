# Redesign Frontend — Design Spec

## Objectif

Moderniser l'interface utilisateur de LocalisationDAB en remplaçant tous les inline styles par **Tailwind CSS**, en appliquant un design **Clair & Épuré** cohérent sur les composants visibles par l'utilisateur final.

## Direction visuelle validée

**B — Clair & Épuré** (approuvé par l'utilisateur)
- Fond blanc, bleu primaire `#2563eb`, ombres douces
- Police **Inter** (Google Fonts)
- Cards avec bordures légères `#f1f5f9` + hover `border-blue-200 shadow-sm`
- Badges colorés pour les états DAB
- Filter chips (pills) à la place des `<select>`
- Bottom sheet arrondie pour la modal signalement

---

## Stack technique

| Outil | Rôle |
|---|---|
| **Tailwind CSS v3** | Classes utilitaires, remplace tous les inline styles |
| **Inter** (Google Fonts) | Police principale, chargée dans `index.html` |
| **react-hot-toast** | Déjà installé, conservé tel quel |
| **Leaflet / react-leaflet** | Carte, non touchée par le redesign |

---

## Design Tokens

```
Couleurs primaires :
  blue-600   #2563eb  → boutons, accents actifs
  blue-50    #eff6ff  → backgrounds actifs, tab active
  blue-100   #dbeafe  → badges bleu
  blue-200   #bfdbfe  → bordures hover

Neutres :
  slate-50   #f8fafc  → background app
  slate-100  #f1f5f9  → séparateurs, card border repos
  slate-200  #e2e8f0  → bordures, inputs
  slate-400  #94a3b8  → texte placeholder / distance
  slate-500  #64748b  → texte secondaire
  gray-700   #374151  → texte corps
  gray-900   #111827  → titres

États DAB :
  green  → badge bg-green-100 text-green-700   (Disponible)
  amber  → badge bg-amber-100 text-amber-700   (Vide)
  red    → badge bg-red-100   text-red-700     (En panne)
  gray   → badge bg-gray-100  text-gray-500    (Actif / inconnu)

Rayon :
  rounded-lg  8px  → inputs, chips, icônes
  rounded-xl  12px → cards, modals
  rounded-2xl 16px → modal bottom sheet
  rounded-full     → badges état, filter chips

Ombres :
  shadow-xs  → cards au repos
  shadow-sm  → cards au hover, navbar
  shadow-md  → FABs, modal
```

---

## Composants à redesigner

### 1. `index.html` + `main.jsx`
- Ajouter lien Google Fonts Inter dans `<head>`
- Configurer Tailwind (`tailwind.config.js`, `postcss.config.js`)
- Remplacer les styles globaux inline dans `main.jsx` par un `index.css` minimal (reset + Leaflet fixes)
- Classe `bg-slate-50` sur `<body>`

### 2. `components/UI/Navbar.jsx`
**Avant :** fond bleu foncé `#1e40af`, texte blanc, tout en inline styles
**Après :**
- `bg-white border-b border-slate-200 shadow-xs h-14`
- Logo : icône `bg-blue-600 rounded-lg` + texte noir avec mot "DAB" en bleu
- Boutons : ghost `hover:bg-gray-100` et primary `bg-blue-600 hover:bg-blue-700 rounded-lg`
- Avatar utilisateur connecté : cercle initiales `bg-blue-50 border border-blue-200`

### 3. `components/UI/SearchBar.jsx`
**Après :**
- `bg-slate-50 border border-slate-200 rounded-xl h-10 px-3`
- Focus : `border-blue-300 bg-white ring-2 ring-blue-100`
- Icône loupe en `text-slate-400`

### 4. `components/DAB/DABFilters.jsx`
**Avant :** `<select>` HTML natifs
**Après :**
- Filter chips (`<button>`) scrollables horizontalement
- Chip repos : `border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-blue-300`
- Chip actif : `border-blue-600 bg-blue-50 text-blue-600`
- Point coloré pour l'état (vert/orange/rouge)

### 5. `components/DAB/DABCard.jsx`
**Après :**
- Container : `bg-white border border-slate-100 rounded-xl p-3.5 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all`
- Icône banque : `bg-blue-50 rounded-lg w-9 h-9`
- Nom : `font-semibold text-sm text-gray-900 truncate`
- Adresse : `text-xs text-slate-400 truncate mt-0.5`
- Badge état : pill coloré (voir tokens ci-dessus)
- Distance : `text-xs font-medium text-slate-400 ml-auto`

### 6. `components/Signalement/SignalementModal.jsx`
**Après :**
- Overlay : `fixed inset-0 bg-slate-900/40 backdrop-blur-sm`
- Sheet : `bg-white rounded-t-2xl p-6` avec handle `w-9 h-1 bg-slate-200 rounded-full mx-auto mb-5`
- 3 boutons état en grid : `border-2 border-slate-200 rounded-xl p-3 hover:border-blue-300 transition-all`
- Bouton actif : couleur spécifique selon état (vert/orange/rouge)
- CTA : `w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold`

### 7. `components/UI/Spinner.jsx`
**Après :**
- `w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin`

### 8. `pages/HomePage.jsx` — Layout desktop
**Après :**
- Sidebar : `w-[340px] bg-white border-r border-slate-200 flex flex-col`
- Section label : `text-xs font-bold uppercase tracking-wide text-slate-400 px-4 py-2`
- Liste : `flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1.5`
- Map area : `flex-1 relative`
- FAB "Proposer" : `absolute bottom-20 right-4 bg-blue-600 text-white rounded-full px-4 h-10 shadow-md text-xs font-semibold`
- FAB géolocalisation : `absolute bottom-4 right-4 bg-white rounded-xl w-11 h-11 shadow-md`

### 9. `pages/HomePage.jsx` — Layout mobile (bottom sheet)
Conserver le comportement actuel, uniquement restyler :
- Handle : `w-9 h-1 bg-slate-300 rounded-full mx-auto my-2`
- Tabs dans le sheet : même style que desktop

---

## Ce qui ne change PAS

- Toute la logique métier (hooks, context, API calls)
- Le comportement de la carte Leaflet
- Les routes et la navigation
- Les pages admin (phase suivante)
- `DABDetail.jsx`, `AvisForm.jsx`, `AvisList.jsx` (phase suivante)
- Les animations des marqueurs Leaflet

---

## Critères de succès

1. `npm run build` sans erreur après migration
2. Tous les composants listés n'ont plus aucun `style={{}}` inline (sauf exceptions Leaflet)
3. La carte reste fonctionnelle sur desktop et mobile
4. Les 56 tests backend continuent de passer (non impactés)
5. Rendu visuel conforme au mockup approuvé
