# CLAUDE.md — Backend
# Chargé automatiquement quand Claude travaille dans ce dossier.
# Complète le CLAUDE.md racine, ne pas le répéter.

---

## 🎯 RESPONSABILITÉ DE CE MODULE

API REST + WebSocket pour LocalisationDAB.
Point d'entrée : `src/server.js` → `src/app.js`

---

## ⚙️ CONVENTIONS DE CODE

### Structure d'un controller
Toujours ce pattern — sans exception :

```js
// Pas de try/catch manuel → express-async-errors s'en charge
const monAction = async (req, res) => {
  // 1. Extraire et valider les params
  // 2. Appel BDD via db.query(SQL, [$1, $2])
  // 3. Retourner via successResponse ou errorResponse
  return successResponse(res, data, 200, 'Message');
};
```

### Format de réponse — TOUJOURS via responseUtils.js
```js
// Succès
successResponse(res, data, statusCode = 200, message = 'Succès')
// → { success: true, message, data, timestamp }

// Erreur
errorResponse(res, message, statusCode = 500, errors = [])
// → { success: false, message, errors, timestamp }
```

### Requêtes SQL — règle absolue
```js
// ✅ Toujours paramétré
db.query('SELECT * FROM dabs WHERE id = $1', [id])

// ❌ Jamais de concaténation
db.query('SELECT * FROM dabs WHERE id = ' + id) // INTERDIT
```

---

## 🗄️ ACCÈS BASE DE DONNÉES

- Pool : `const db = require('../config/db')`
- Fonction : `db.query(text, params)` → retourne `{ rows, rowCount }`
- Transactions : `const client = await db.getClient()` puis `client.query()`
- Toujours `client.release()` dans un `finally`

---

## 🔒 SÉCURITÉ — RAPPEL BACKEND

| Point | Règle |
|---|---|
| IP | SHA-256 + `process.env.IP_SALT` — jamais brute |
| JWT | Vérifier `is_active = true` après décodage |
| Body | Limité à 10kb — configuré dans app.js |
| SQL | Uniquement requêtes paramétrées |
| password_hash | Jamais dans les réponses API |
| Erreur auth | Message générique uniquement |

---

## 📡 WEBSOCKET — USAGE

```js
const { getIO } = require('../config/socket');

// Émettre à tous les clients (mise à jour carte globale)
getIO().emit('dab_update', { dabId, etatCommunautaire, votes });

// Émettre à une room spécifique (page détail d'un DAB)
getIO().to(`dab_${dabId}`).emit('dab_statut_change', { ... });
```

---

## 🌱 SEEDS & MIGRATIONS

```bash
# Appliquer la migration initiale
psql $DATABASE_URL -f migrations/001_init.sql

# Insérer les données de test
psql $DATABASE_URL -f seeds/seed.sql

# Import Google Places manuel
node -e "require('./src/utils/osmImport').syncGooglePlaces().then(console.log)"
```

---

## 📦 DÉPENDANCES CLÉS

| Package | Usage |
|---|---|
| `express-async-errors` | Catch async automatique — importer en premier dans app.js |
| `express-validator` | Validation inputs — toujours via validators/ |
| `socket.io` | WebSocket — init dans config/socket.js |
| `node-cron` | Cron sync Google Places — déclaré dans app.js |
| `bcryptjs` | Hash passwords — BCRYPT_ROUNDS depuis env |
| `jsonwebtoken` | Auth JWT — secret depuis env |

---

## 🚫 INTERDICTIONS STRICTES

- Ne jamais modifier `migrations/001_init.sql` sans créer `002_*.sql`
- Ne jamais stocker une IP brute dans la BDD
- Ne jamais exposer `password_hash` dans une réponse
- Ne jamais faire de `console.log` en production (utiliser un logger)
- Ne jamais `DROP TABLE` sans confirmation explicite
