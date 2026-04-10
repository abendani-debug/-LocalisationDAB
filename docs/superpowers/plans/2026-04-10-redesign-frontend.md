# Redesign Frontend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer le frontend LocalisationDAB vers Tailwind CSS avec un design Clair & Épuré sur les composants visibles, sur une branche dédiée pour permettre régression propre.

**Architecture:** Installation de Tailwind v3 dans le dossier `frontend/`, migration des inline styles vers des classes Tailwind composant par composant, styles globaux déplacés de `main.jsx` vers `src/index.css`. Aucune logique métier modifiée.

**Tech Stack:** Tailwind CSS v3, PostCSS, Autoprefixer, Inter (Google Fonts), React 18, Vite 5.

---

## Fichiers créés / modifiés

| Fichier | Action |
|---|---|
| `frontend/tailwind.config.js` | Créé |
| `frontend/postcss.config.js` | Créé |
| `frontend/src/index.css` | Créé (migration styles globaux) |
| `frontend/index.html` | Modifié (ajout lien Inter) |
| `frontend/src/main.jsx` | Modifié (import index.css, suppression style inline) |
| `frontend/src/components/UI/Navbar.jsx` | Redesign Tailwind |
| `frontend/src/components/UI/SearchBar.jsx` | Redesign Tailwind |
| `frontend/src/components/UI/Spinner.jsx` | Redesign Tailwind |
| `frontend/src/components/DAB/DABFilters.jsx` | Redesign Tailwind (chips) |
| `frontend/src/components/DAB/DABCard.jsx` | Redesign Tailwind |
| `frontend/src/components/Signalement/SignalementModal.jsx` | Redesign Tailwind |
| `frontend/src/components/Signalement/SignalementButton.jsx` | Redesign Tailwind |
| `frontend/src/pages/HomePage.jsx` | Redesign Tailwind |

---

## Task 1 : Branche git + Installation Tailwind

**Files:**
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`

- [ ] **Step 1 : Créer la branche de travail**

```bash
cd /c/Users/ben31/Documents/LocalisationDAB
git checkout -b feat/redesign-ui
```

Résultat attendu : `Switched to a new branch 'feat/redesign-ui'`

- [ ] **Step 2 : Installer Tailwind et ses dépendances**

```bash
cd /c/Users/ben31/Documents/LocalisationDAB/frontend
npm install -D tailwindcss postcss autoprefixer
```

Résultat attendu : packages ajoutés dans `devDependencies`.

- [ ] **Step 3 : Créer tailwind.config.js**

```js
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 4 : Créer postcss.config.js**

```js
// frontend/postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5 : Vérifier que Vite démarre sans erreur**

```bash
cd frontend && npm run dev
```

Résultat attendu : serveur Vite démarre sur http://localhost:5173, pas d'erreur dans le terminal.

- [ ] **Step 6 : Commit**

```bash
git add frontend/tailwind.config.js frontend/postcss.config.js frontend/package.json frontend/package-lock.json
git commit -m "chore: install Tailwind CSS v3 + PostCSS"
```

---

## Task 2 : Styles globaux (index.css + main.jsx + index.html)

**Files:**
- Create: `frontend/src/index.css`
- Modify: `frontend/src/main.jsx`
- Modify: `frontend/index.html`

- [ ] **Step 1 : Créer src/index.css**

Migre le bloc `style.textContent` de `main.jsx` vers ce fichier et ajoute les directives Tailwind.

```css
/* frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── Leaflet fixes ───────────────────────────────────────────── */
@media (max-width: 640px) {
  .leaflet-control-zoom { margin-bottom: 80px !important; }
  .leaflet-top.leaflet-right { top: auto !important; bottom: 140px !important; }
}

/* ── Bottom sheet transition ─────────────────────────────────── */
.bottom-sheet {
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Animation cinématique DAB marker ───────────────────────── */
@keyframes dabSpring {
  0%   { transform: scale(1);    filter: none; }
  10%  { transform: scale(2.65); filter: drop-shadow(0 0 26px #60a5fa) drop-shadow(0 0 12px #2563eb); }
  20%  { transform: scale(1.82); filter: drop-shadow(0 0 14px #3b82f6); }
  34%  { transform: scale(2.32); filter: drop-shadow(0 0 22px #2563eb) drop-shadow(0 0 10px #1d4ed8); }
  48%  { transform: scale(1.97); filter: drop-shadow(0 0 16px #2563eb); }
  63%  { transform: scale(2.20); filter: drop-shadow(0 0 18px #2563eb) drop-shadow(0 0 8px #2563eb); }
  79%  { transform: scale(2.06); filter: drop-shadow(0 0 16px #2563eb); }
  100% { transform: scale(2.1);  filter: drop-shadow(0 0 16px #2563eb) drop-shadow(0 0 8px #2563eb) drop-shadow(0 0 3px #1d4ed8); }
}

.dab-marker-highlighted { z-index: 9999 !important; }

.dab-icon-inner {
  transform-origin: bottom center;
  will-change: transform;
}

.dab-marker-active .dab-icon-inner,
.dab-marker-highlighted .dab-icon-inner {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              filter   0.3s ease;
}

.dab-marker-highlighted .dab-icon-inner {
  animation: dabSpring 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.dab-marker-active .dab-icon-inner {
  transform: scale(2.1);
  filter: drop-shadow(0 0 16px #2563eb) drop-shadow(0 0 8px #2563eb) drop-shadow(0 0 3px #1d4ed8);
}

.leaflet-zoom-anim .dab-icon-inner {
  filter: none !important;
  transition: none !important;
  animation: none !important;
}

/* ── iOS zoom prevention ────────────────────────────────────── */
@media (max-width: 640px) {
  input, select, textarea { font-size: 16px !important; }
}
```

- [ ] **Step 2 : Mettre à jour main.jsx**

Remplacer le fichier entier — supprimer le bloc `style.textContent`, importer `index.css` à la place.

```jsx
// frontend/src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './index.css';
import L from 'leaflet';
import App from './App';

// Fix icône Leaflet (bug connu avec bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 3 : Ajouter la police Inter dans index.html**

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Localisez les DAB près de chez vous et signalez leur état en temps réel." />
    <title>LocalisationDAB</title>
    <link rel="icon" type="image/svg+xml" href="/atm.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-slate-50 font-sans text-gray-900">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4 : Configurer Inter dans tailwind.config.js**

```js
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5 : Vérifier que l'app démarre et que les styles Leaflet sont toujours ok**

```bash
npm run dev
```

Ouvrir http://localhost:5173, vérifier que la carte s'affiche correctement, les marqueurs sont visibles.

- [ ] **Step 6 : Commit**

```bash
git add frontend/src/index.css frontend/src/main.jsx frontend/index.html frontend/tailwind.config.js
git commit -m "chore: setup Tailwind base, Inter font, migrate global CSS to index.css"
```

---

## Task 3 : Redesign Navbar.jsx

**Files:**
- Modify: `frontend/src/components/UI/Navbar.jsx`

- [ ] **Step 1 : Remplacer Navbar.jsx**

```jsx
// frontend/src/components/UI/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useIsMobile from '../../hooks/useIsMobile';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-[1000] shadow-sm">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-base leading-none">
          💳
        </div>
        <span className="font-bold text-gray-900 text-[15px]">
          Localisation<span className="text-blue-600">DAB</span>
        </span>
      </Link>

      {/* Desktop nav */}
      {!isMobile && (
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin" className="text-sm text-slate-500 hover:text-gray-900 no-underline transition-colors">
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-500">{user?.nom}</span>
              <button
                onClick={handleLogout}
                className="h-[34px] px-4 rounded-lg border border-slate-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-500 hover:text-gray-900 no-underline transition-colors">
                Connexion
              </Link>
              <Link to="/register" className="h-[34px] px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors no-underline flex items-center">
                Inscription
              </Link>
            </>
          )}
        </div>
      )}

      {/* Mobile hamburger */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={menuOpen}
          className="flex flex-col gap-[5px] justify-center p-2 bg-transparent border-none cursor-pointer"
        >
          <span className="block w-[22px] h-[2px] bg-gray-700 rounded-sm transition-transform duration-200"
            style={{ transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span className="block w-[22px] h-[2px] bg-gray-700 rounded-sm transition-opacity duration-150"
            style={{ opacity: menuOpen ? 0 : 1 }} />
          <span className="block w-[22px] h-[2px] bg-gray-700 rounded-sm transition-transform duration-200"
            style={{ transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>
      )}

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 shadow-md z-[999] flex flex-col">
          {isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}
              className="text-gray-700 no-underline px-5 py-4 text-base border-b border-slate-100 hover:bg-slate-50">
              ⚙️ Administration
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <span className="text-slate-500 px-5 py-4 text-sm border-b border-slate-100">👤 {user?.nom}</span>
              <button onClick={handleLogout}
                className="bg-transparent border-none text-gray-700 px-5 py-4 text-left cursor-pointer text-base hover:bg-slate-50">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="text-gray-700 no-underline px-5 py-4 text-base border-b border-slate-100 hover:bg-slate-50">
                Connexion
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="text-white no-underline px-5 py-4 text-base bg-blue-600 hover:bg-blue-700">
                Inscription
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2 : Vérifier visuellement**

Ouvrir http://localhost:5173 — la navbar doit être blanche avec le logo bleu, pas de fond bleu foncé.

- [ ] **Step 3 : Commit**

```bash
git add frontend/src/components/UI/Navbar.jsx
git commit -m "feat: redesign Navbar with Tailwind (white, Inter, blue logo)"
```

---

## Task 4 : Redesign SearchBar.jsx + Spinner.jsx

**Files:**
- Modify: `frontend/src/components/UI/SearchBar.jsx`
- Modify: `frontend/src/components/UI/Spinner.jsx`

- [ ] **Step 1 : Remplacer SearchBar.jsx**

```jsx
// frontend/src/components/UI/SearchBar.jsx
import { useState } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Rechercher un DAB…' }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 h-10 focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
      <span className="text-slate-400 text-sm">🔍</span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-slate-400"
      />
    </form>
  );
}
```

- [ ] **Step 2 : Remplacer Spinner.jsx**

```jsx
// frontend/src/components/UI/Spinner.jsx
const SIZES = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-[3px]' };

export default function Spinner({ size = 'md', label = 'Chargement…' }) {
  return (
    <div role="status" className="flex flex-col items-center gap-2">
      <div className={`${SIZES[size] || SIZES.md} border-slate-200 border-t-blue-600 rounded-full animate-spin`} />
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}
```

- [ ] **Step 3 : Commit**

```bash
git add frontend/src/components/UI/SearchBar.jsx frontend/src/components/UI/Spinner.jsx
git commit -m "feat: redesign SearchBar and Spinner with Tailwind"
```

---

## Task 5 : Redesign DABFilters.jsx (chips)

**Files:**
- Modify: `frontend/src/components/DAB/DABFilters.jsx`

Les 3 `<select>` sont remplacés par des rangées de chips horizontalement scrollables. L'interface `onFiltersChange` reste identique.

- [ ] **Step 1 : Remplacer DABFilters.jsx**

```jsx
// frontend/src/components/DAB/DABFilters.jsx
import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

const STATUTS = [
  { value: '',              label: 'Tous' },
  { value: 'actif',         label: 'Actif' },
  { value: 'hors_service',  label: 'Hors service' },
  { value: 'maintenance',   label: 'Maintenance' },
];

const RAYONS = [
  { value: 1,  label: '1 km' },
  { value: 2,  label: '2 km' },
  { value: 5,  label: '5 km' },
  { value: 10, label: '10 km' },
];

function ChipRow({ label, items, activeValue, onSelect, getKey, getLabel }) {
  return (
    <div className="px-4 py-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {items.map((item) => {
          const key   = getKey(item);
          const text  = getLabel(item);
          const active = String(activeValue) === String(key);
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`flex-shrink-0 h-7 px-3 rounded-full text-xs font-medium border transition-all cursor-pointer
                ${active
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DABFilters({ onFiltersChange }) {
  const [banques, setBanques] = useState([]);
  const [filters, setFilters] = useState({ banque_id: '', statut: '', radius: 2 });

  useEffect(() => {
    api.get('/banques').then((r) => setBanques(r.data.data || [])).catch(() => {});
  }, []);

  const handleChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFiltersChange(next);
  };

  const banqueItems = [{ id: '', nom: 'Toutes' }, ...banques];

  return (
    <div className="flex flex-col divide-y divide-slate-100">
      <ChipRow
        label="Banque"
        items={banqueItems}
        activeValue={filters.banque_id}
        onSelect={(v) => handleChange('banque_id', v)}
        getKey={(b) => b.id}
        getLabel={(b) => b.nom}
      />
      <ChipRow
        label="Statut"
        items={STATUTS}
        activeValue={filters.statut}
        onSelect={(v) => handleChange('statut', v)}
        getKey={(s) => s.value}
        getLabel={(s) => s.label}
      />
      <ChipRow
        label="Rayon"
        items={RAYONS}
        activeValue={filters.radius}
        onSelect={(v) => handleChange('radius', Number(v))}
        getKey={(r) => r.value}
        getLabel={(r) => r.label}
      />
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier que les filtres fonctionnent**

Ouvrir http://localhost:5173, aller dans l'onglet Filtres, cliquer sur des chips → la liste de DAB doit se mettre à jour.

- [ ] **Step 3 : Commit**

```bash
git add frontend/src/components/DAB/DABFilters.jsx
git commit -m "feat: redesign DABFilters with chip rows (replace selects)"
```

---

## Task 6 : Redesign DABCard.jsx

**Files:**
- Modify: `frontend/src/components/DAB/DABCard.jsx`

- [ ] **Step 1 : Remplacer DABCard.jsx**

```jsx
// frontend/src/components/DAB/DABCard.jsx
import { etatColor, statutLabel, etatLabel, formatDistance } from '../../utils/formatUtils';

const BADGE = {
  green:  'bg-green-100 text-green-700',
  orange: 'bg-amber-100 text-amber-700',
  red:    'bg-red-100   text-red-700',
};

const ETAT_BADGE = {
  disponible: 'bg-green-100 text-green-700',
  vide:       'bg-amber-100 text-amber-700',
  en_panne:   'bg-red-100   text-red-700',
};

export default function DABCard({ dab, onSelect, onHighlight }) {
  const color = etatColor(dab);

  return (
    <div
      onClick={() => onHighlight?.(dab.id)}
      className="bg-white border border-slate-100 rounded-xl p-3.5 cursor-pointer transition-all hover:border-blue-200 hover:shadow-sm flex flex-col gap-2"
    >
      <div className="flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">
          🏧
        </div>
        <div className="flex-1 min-w-0">
          <p className="m-0 font-semibold text-sm text-gray-900 truncate">{dab.nom}</p>
          {dab.adresse && (
            <p className="m-0 mt-0.5 text-xs text-slate-400 truncate">{dab.adresse}</p>
          )}
        </div>
        {dab.distance_km != null && (
          <span className="text-xs font-medium text-slate-400 flex-shrink-0">
            {formatDistance(dab.distance_km)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${BADGE[color] || 'bg-gray-100 text-gray-500'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
          {statutLabel(dab.statut)}
        </span>

        {dab.banque_nom && (
          <span className="text-[10px] text-slate-500">{dab.banque_nom}</span>
        )}

        {(dab.etat_communautaire || dab.vote_dominant) && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${ETAT_BADGE[dab.etat_communautaire || dab.vote_dominant] || 'bg-gray-100 text-gray-500'}`}
            style={{ opacity: dab.etat_communautaire ? 1 : 0.75 }}>
            👥 {etatLabel(dab.etat_communautaire || dab.vote_dominant)}
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier visuellement**

La liste de DAB doit afficher des cards blanches avec bordure légère, badges colorés, et hover bleu.

- [ ] **Step 3 : Commit**

```bash
git add frontend/src/components/DAB/DABCard.jsx
git commit -m "feat: redesign DABCard with Tailwind (badges, hover, layout)"
```

---

## Task 7 : Redesign SignalementModal.jsx + SignalementButton.jsx

**Files:**
- Modify: `frontend/src/components/Signalement/SignalementModal.jsx`
- Modify: `frontend/src/components/Signalement/SignalementButton.jsx`

- [ ] **Step 1 : Remplacer SignalementModal.jsx**

```jsx
// frontend/src/components/Signalement/SignalementModal.jsx
import SignalementButton from './SignalementButton';
import useIsMobile from '../../hooks/useIsMobile';

export default function SignalementModal({ dab, onClose, onSuccess }) {
  const isMobile = useIsMobile();
  if (!dab) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[2000] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 pb-8 sm:pb-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle mobile */}
        <div className="w-9 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />

        <div className="flex items-start justify-between mb-1">
          <h3 className="m-0 text-base font-bold text-gray-900">Signaler l'état du DAB</h3>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-slate-400 hover:text-gray-700 cursor-pointer text-xl leading-none p-1 -mt-1 -mr-1"
          >
            ✕
          </button>
        </div>

        <p className="m-0 mb-5 text-xs text-slate-400">
          {dab.nom} · Votre signalement est anonyme
        </p>

        <SignalementButton
          dabId={dab.id}
          onSuccess={(data) => { onSuccess?.(data); onClose(); }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Remplacer SignalementButton.jsx**

```jsx
// frontend/src/components/Signalement/SignalementButton.jsx
import { useState } from 'react';
import { submitSignalement } from '../../api/signalementApi';
import toast from 'react-hot-toast';

const ETATS = [
  { key: 'disponible', label: 'Disponible', emoji: '✅', border: 'hover:border-green-500',  active: 'border-green-500 bg-green-50' },
  { key: 'vide',       label: 'Vide',       emoji: '💸', border: 'hover:border-amber-500', active: 'border-amber-500 bg-amber-50' },
  { key: 'en_panne',   label: 'En panne',   emoji: '🔧', border: 'hover:border-red-500',   active: 'border-red-500   bg-red-50'   },
];

export default function SignalementButton({ dabId, onSuccess }) {
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSignal = async (etat) => {
    setSelected(etat);
    setLoading(true);
    try {
      const res = await submitSignalement(dabId, etat);
      toast.success('Signalement enregistré !');
      onSuccess?.(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors du signalement.';
      toast.error(msg);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {ETATS.map(({ key, label, emoji, border, active }) => (
          <button
            key={key}
            disabled={loading}
            onClick={() => handleSignal(key)}
            className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer bg-white font-[inherit]
              disabled:opacity-60 disabled:cursor-not-allowed
              ${selected === key ? active : `border-slate-200 ${border}`}`}
          >
            <div className="text-2xl mb-1">{emoji}</div>
            <div className="text-[11px] font-semibold text-gray-700">{label}</div>
          </button>
        ))}
      </div>
      <button
        disabled={!selected || loading}
        onClick={() => selected && handleSignal(selected)}
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed font-[inherit]"
      >
        {loading ? 'Envoi…' : 'Envoyer le signalement'}
      </button>
    </div>
  );
}
```

- [ ] **Step 3 : Vérifier visuellement**

Cliquer sur un marqueur DAB → ouvrir le détail → cliquer "Signaler" → la modal doit s'ouvrir avec les 3 boutons en grille.

- [ ] **Step 4 : Commit**

```bash
git add frontend/src/components/Signalement/SignalementModal.jsx frontend/src/components/Signalement/SignalementButton.jsx
git commit -m "feat: redesign SignalementModal and SignalementButton with Tailwind"
```

---

## Task 8 : Redesign HomePage.jsx

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx`

- [ ] **Step 1 : Remplacer HomePage.jsx**

```jsx
// frontend/src/pages/HomePage.jsx
import { useState, useCallback, useEffect, useRef } from 'react';
import MapView from '../components/Map/MapView';
import DABList from '../components/DAB/DABList';
import DABFilters from '../components/DAB/DABFilters';
import DABDetailModal from '../components/DAB/DABDetailModal';
import useGeolocation from '../hooks/useGeolocation';
import useDABs from '../hooks/useDABs';
import useSocket from '../hooks/useSocket';
import useIsMobile from '../hooks/useIsMobile';

export default function HomePage() {
  const { position } = useGeolocation();
  const [mapCenter, setMapCenter]         = useState(null);
  const [filters, setFilters]             = useState({ radius: 5 });
  const searchPosition                    = mapCenter || position;
  const { dabs, loading, error, refetch, updateDAB } = useDABs(searchPosition, filters);
  const [panel, setPanel]                 = useState('list');
  const [sheetOpen, setSheetOpen]         = useState(false);
  const [selectedDabId, setSelectedDabId] = useState(null);
  const [highlight, setHighlight]         = useState({ id: null, tick: 0 });
  const [flyTo, setFlyTo]                 = useState(null);
  const lastFliedBanque                   = useRef(null);
  const isMobile                          = useIsMobile();

  useEffect(() => {
    if (!filters.banque_id) { lastFliedBanque.current = null; return; }
    if (loading || dabs.length === 0) return;
    if (lastFliedBanque.current === filters.banque_id) return;
    lastFliedBanque.current = filters.banque_id;
    const first = dabs[0];
    setFlyTo({ lat: first.latitude, lng: first.longitude });
  }, [filters.banque_id, dabs, loading]);

  const handleHighlight = useCallback((id) => {
    setHighlight((prev) => ({ id, tick: prev.tick + 1 }));
    const dab = dabs.find((d) => d.id === id);
    if (dab) setFlyTo({ lat: dab.latitude, lng: dab.longitude });
    if (isMobile) setSheetOpen(false);
  }, [dabs, isMobile]);

  const handleDabUpdate = useCallback(({ dabId, etatCommunautaire, votes, totalVotes }) => {
    const vote_dominant = !etatCommunautaire && votes && totalVotes > 0
      ? (Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0] || null)
      : null;
    updateDAB(dabId, { etat_communautaire: etatCommunautaire, nb_votes_actifs: totalVotes, vote_dominant });
  }, [updateDAB]);

  useSocket(handleDabUpdate);

  /* ── Desktop ───────────────────────────────────────────────── */
  if (!isMobile) {
    return (
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside className="w-[340px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {['list', 'filters'].map((p) => (
              <button
                key={p}
                onClick={() => setPanel(p)}
                className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-l-0 border-r-0 border-t-0
                  ${panel === p
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-gray-700'
                  }`}
              >
                {p === 'list' ? `DAB (${dabs.length})` : 'Filtres'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {panel === 'filters'
              ? <DABFilters onFiltersChange={setFilters} />
              : <DABList
                  dabs={dabs} loading={loading} error={error}
                  onRetry={refetch} onSelectDAB={setSelectedDabId}
                  onHighlightDAB={handleHighlight}
                />
            }
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1">
          <MapView
            dabs={dabs} userPosition={position}
            onCenterChange={setMapCenter} onSelectDAB={setSelectedDabId}
            highlight={highlight} flyTo={flyTo}
          />
        </div>

        {selectedDabId && (
          <DABDetailModal dabId={selectedDabId} onClose={() => setSelectedDabId(null)} />
        )}
      </div>
    );
  }

  /* ── Mobile ────────────────────────────────────────────────── */
  const HANDLE_HEIGHT = 44;
  const SHEET_HEIGHT  = '55vh';

  return (
    <div className="relative overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Carte plein écran */}
      <div className="absolute inset-0">
        <MapView
          dabs={dabs} userPosition={position}
          onCenterChange={setMapCenter} onSelectDAB={setSelectedDabId}
          highlight={highlight} flyTo={flyTo}
        />
      </div>

      {/* Bottom sheet */}
      <div
        className="bottom-sheet absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-3px_16px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden z-[500]"
        style={{ height: sheetOpen ? SHEET_HEIGHT : `${HANDLE_HEIGHT}px` }}
      >
        {/* Handle + tabs */}
        <div
          onClick={() => setSheetOpen((v) => !v)}
          className="flex-shrink-0 flex items-center justify-between px-3 cursor-pointer select-none"
          style={{ height: `${HANDLE_HEIGHT}px` }}
        >
          <div className="flex gap-1.5">
            {['list', 'filters'].map((p) => (
              <button
                key={p}
                onClick={(e) => { e.stopPropagation(); setPanel(p); if (!sheetOpen) setSheetOpen(true); }}
                className={`h-7 px-3 rounded-full text-xs font-medium border transition-all cursor-pointer
                  ${panel === p
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-transparent text-slate-500'
                  }`}
              >
                {p === 'list' ? `DAB (${dabs.length})` : 'Filtres'}
              </button>
            ))}
          </div>
          <span
            className="text-xs text-slate-400 inline-block transition-transform duration-300"
            style={{ transform: sheetOpen ? 'rotate(180deg)' : 'none' }}
          >
            ▲
          </span>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {panel === 'filters'
            ? <DABFilters onFiltersChange={setFilters} />
            : <DABList
                dabs={dabs} loading={loading} error={error}
                onRetry={refetch} onSelectDAB={setSelectedDabId}
                onHighlightDAB={handleHighlight}
              />
          }
        </div>
      </div>

      {selectedDabId && (
        <DABDetailModal dabId={selectedDabId} onClose={() => setSelectedDabId(null)} />
      )}
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier desktop et mobile**

Desktop : sidebar blanche avec tabs, liste de cards, carte à droite.
Mobile : carte plein écran, bottom sheet avec tabs.

- [ ] **Step 3 : Commit**

```bash
git add frontend/src/pages/HomePage.jsx
git commit -m "feat: redesign HomePage layout with Tailwind (desktop sidebar + mobile sheet)"
```

---

## Task 9 : Vérification build + push branche

- [ ] **Step 1 : Build de production**

```bash
cd /c/Users/ben31/Documents/LocalisationDAB/frontend
npm run build
```

Résultat attendu : `✓ built in Xs` sans erreur. Warnings autorisés.

- [ ] **Step 2 : Vérifier que les tests backend sont toujours verts (non impactés)**

```bash
cd /c/Users/ben31/Documents/LocalisationDAB/backend
npm test
```

Résultat attendu : 56 tests PASS.

- [ ] **Step 3 : Ajouter .superpowers/ au .gitignore si absent**

```bash
cd /c/Users/ben31/Documents/LocalisationDAB
grep -q ".superpowers" .gitignore 2>/dev/null || echo ".superpowers/" >> .gitignore
git add .gitignore
```

- [ ] **Step 4 : Commit final et push branche**

```bash
git add .
git commit -m "feat: complete frontend redesign with Tailwind CSS (Clair & Épuré)"
git push -u origin feat/redesign-ui
```

- [ ] **Step 5 : Instructions régression**

Si le résultat n'est pas satisfaisant, revenir à main en une commande :
```bash
git checkout main
```
La branche `feat/redesign-ui` reste disponible pour itérer.

Pour fusionner quand le résultat est validé :
```bash
git checkout main
git merge feat/redesign-ui
git push origin main
```

---

## Auto-review

### Couverture spec
- ✅ Tailwind CSS v3 installé — Task 1
- ✅ Inter (Google Fonts) — Task 2
- ✅ index.css (migration styles globaux) — Task 2
- ✅ Navbar redesign — Task 3
- ✅ SearchBar redesign — Task 4
- ✅ Spinner redesign — Task 4
- ✅ DABFilters chips — Task 5
- ✅ DABCard redesign — Task 6
- ✅ SignalementModal redesign — Task 7
- ✅ SignalementButton redesign — Task 7
- ✅ HomePage desktop + mobile — Task 8
- ✅ Build vérifié — Task 9
- ✅ Branche dédiée + instructions régression — Task 1 + 9

### Points d'attention
- `SignalementButton` a été modifié pour ajouter un état `selected` local — le bouton CTA n'est actif qu'après avoir sélectionné un état. Comportement légèrement différent de l'original (où chaque bouton soumettait directement).
- Les animations Leaflet (`dabSpring`, `.dab-marker-highlighted`) sont préservées intégralement dans `index.css`.
- Aucun `style={{}}` inline ne subsiste dans les composants redesignés, sauf les valeurs dynamiques (`height: sheetOpen ? ...`) qui ne peuvent pas être exprimées en Tailwind sans configuration supplémentaire.
