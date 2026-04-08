# CLAUDE.md — Frontend
# Chargé automatiquement quand Claude travaille dans ce dossier.
# Complète le CLAUDE.md racine, ne pas le répéter.

---

## 🎯 RESPONSABILITÉ DE CE MODULE

Interface React + Leaflet pour LocalisationDAB.
Point d'entrée : `src/main.jsx` → `src/App.jsx`

---

## ⚙️ CONVENTIONS DE CODE

### Composant React — structure standard
```jsx
// 1. Imports React
import { useState, useEffect, useCallback } from 'react';
// 2. Imports libs externes
import toast from 'react-hot-toast';
// 3. Imports internes (api, hooks, utils)
import { submitSignalement } from '../../api/signalementApi';
// 4. Imports composants enfants

export default function MonComposant({ prop1, prop2 }) {
  // 5. Hooks d'état
  const [data, setData] = useState(null);
  // 6. Hooks personnalisés
  // 7. Effets
  // 8. Handlers (useCallback si passés en props)
  // 9. Rendu
  return <div>...</div>;
}
```

### Validation formulaires — toujours react-hook-form + Zod
```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Min 8 caractères')
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

### Appels API — toujours via les fichiers api/
```jsx
// ✅ Via le service dédié
import { getDABs } from '../api/dabApi';

// ❌ Jamais directement dans un composant
fetch('/api/dabs') // INTERDIT
```

---

## 🔑 COOKIE ANONYME — signalementApi.js

Le cookie UUID est géré dans `src/api/signalementApi.js`.
Ne jamais dupliquer cette logique ailleurs.

```js
const getCookieId = () => {
  let id = localStorage.getItem('dab_cookie_id');
  if (!id) { id = uuidv4(); localStorage.setItem('dab_cookie_id', id); }
  return id;
};
```

---

## 🗺️ LEAFLET — RÈGLES IMPORTANTES

```jsx
// 1. Importer les CSS Leaflet dans main.jsx (pas dans le composant)
import 'leaflet/dist/leaflet.css';

// 2. Corriger l'icône par défaut de Leaflet (bug connu)
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '...',
  iconUrl: '...',
  shadowUrl: '...',
});

// 3. MapContainer ne doit avoir qu'un seul enfant TileLayer
// 4. useMap() uniquement dans un composant enfant de MapContainer
```

### Couleurs des marqueurs selon état
```js
const getMarkerColor = (dab) => {
  // Priorité : état communautaire > statut admin
  if (dab.etat_communautaire === 'en_panne')    return 'red';
  if (dab.etat_communautaire === 'vide')         return 'orange';
  if (dab.etat_communautaire === 'disponible')   return 'green';
  if (dab.statut === 'hors_service')             return 'red';
  if (dab.statut === 'maintenance')              return 'orange';
  return 'green'; // actif par défaut
};
```

---

## ⚡ WEBSOCKET — useSocket.js

```jsx
// Utilisation dans HomePage.jsx
const handleDabUpdate = useCallback(({ dabId, etatCommunautaire, votes }) => {
  setDabs(prev =>
    prev.map(d => d.id === dabId
      ? { ...d, etat_communautaire: etatCommunautaire, votes }
      : d
    )
  );
}, []);

useSocket(handleDabUpdate);
```

---

## 🎨 SIGNALEMENT — 3 ÉTATS UNIQUEMENT

```jsx
// Boutons dans SignalementButton.jsx — ne pas modifier ces valeurs
const ETATS = [
  { key: 'disponible', label: 'Argent dispo', color: 'green'  },
  { key: 'vide',       label: 'DAB vide',     color: 'amber'  },
  { key: 'en_panne',   label: 'En panne',     color: 'red'    },
];
// Aucune auth requise — disponible pour tous les utilisateurs
```

---

## 🔐 AUTHENTIFICATION — AuthContext.jsx

```jsx
// Utilisation dans n'importe quel composant
const { user, token, isAuthenticated, isAdmin, login, logout } = useAuth();

// Routes protégées
<PrivateRoute>  // → redirige vers /login si non authentifié
<AdminRoute>    // → redirige vers / si non admin
```

---

## 📦 DÉPENDANCES CLÉS

| Package | Usage |
|---|---|
| `react-leaflet` | Carte interactive |
| `react-hook-form` | Formulaires |
| `@hookform/resolvers` + `zod` | Validation schémas |
| `react-hot-toast` | Notifications utilisateur |
| `socket.io-client` | WebSocket temps réel |
| `axios` | Appels API (config dans axiosConfig.js) |
| `react-router-dom v6` | Routing (useNavigate, useParams…) |

---

## 🗺️ IMPORT GOOGLE PLACES — ADMIN

Le bouton d'import dans `AdminDashboard.jsx` appelle `POST /api/admin/import-google`.
Le label du bouton est **"Import Google Places"** (pas "Import OSM").

---

## 🚫 INTERDICTIONS STRICTES

- Ne jamais appeler `fetch()` directement dans un composant
- Ne jamais stocker le token JWT autre part que `localStorage`
- Ne jamais mettre de secrets dans les variables `VITE_*`
- Ne jamais utiliser `dangerouslySetInnerHTML` sans sanitisation
- Ne jamais faire de `console.log` en production
- Toujours gérer les états `loading` et `error` dans les composants
