# Tests Backend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Écrire les tests d'intégration backend (supertest) pour les 4 domaines : auth, dab, avis, signalement.

**Architecture:** Chaque suite de tests utilise `supertest` pour appeler l'API HTTP réelle. Les modèles PostgreSQL et les modules d'infrastructure (db, socket, cron) sont mockés via `jest.mock()` pour éviter toute dépendance à une base réelle. Un fichier `setup.js` injecte les variables d'environnement requises avant le chargement de `env.js`.

**Tech Stack:** Jest 29, Supertest 7, jest.mock() pour les modèles, process.env pour les vars de test.

---

## Fichiers créés / modifiés

| Fichier | Rôle |
|---|---|
| `backend/jest.config.js` | Config Jest : testMatch, setupFiles, timeout |
| `backend/tests/setup.js` | Variables d'env + mocks d'infrastructure globaux |
| `backend/tests/auth.test.js` | Tests POST /api/auth/register, login, GET /me, PUT /password |
| `backend/tests/dab.test.js` | Tests CRUD DAB + propositions communautaires |
| `backend/tests/avis.test.js` | Tests avis (GET, POST auth, DELETE owner/admin) |
| `backend/tests/signalement.test.js` | Tests signalement anonyme, anti-spam, résolution |

---

## Task 1 : Infrastructure de test (jest.config.js + setup.js)

**Files:**
- Create: `backend/jest.config.js`
- Create: `backend/tests/setup.js`

- [ ] **Step 1 : Créer jest.config.js**

```js
// backend/jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['./tests/setup.js'],
  testTimeout: 10000,
};
```

- [ ] **Step 2 : Créer tests/setup.js**

```js
// backend/tests/setup.js
// Injecte les variables d'env AVANT que env.js soit chargé
process.env.DATABASE_URL       = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET         = 'a'.repeat(64);
process.env.JWT_EXPIRES_IN     = '1h';
process.env.IP_SALT            = 'b'.repeat(32);
process.env.GOOGLE_PLACES_API_KEY = 'fake_google_key_for_tests';
process.env.NODE_ENV           = 'test';
process.env.BCRYPT_ROUNDS      = '4';   // Rapide en tests
process.env.SIGNALEMENT_SEUIL  = '2';
process.env.SIGNALEMENT_DUREE_HEURES = '4';
process.env.CORS_ORIGIN        = 'http://localhost:5173';
```

- [ ] **Step 3 : Vérifier que Jest se lance sans erreur (aucun test encore)**

```bash
cd backend && npx jest --listTests
```

Résultat attendu : aucune erreur, liste vide ou `No tests found`.

- [ ] **Step 4 : Commit**

```bash
cd backend
git add jest.config.js tests/setup.js
git commit -m "test: add jest config and env setup"
```

---

## Task 2 : Tests Auth

**Files:**
- Create: `backend/tests/auth.test.js`

Les mocks nécessaires dans ce fichier :
- `jest.mock('../src/config/db')` → empêche pg de se connecter
- `jest.mock('node-cron')` → empêche le cron de démarrer
- `jest.mock('../src/utils/osmImport')` → empêche l'import Google Places
- `jest.mock('../src/config/socket')` → pas de Socket.io
- `jest.mock('../src/models/User')` → contrôle total des données

- [ ] **Step 1 : Écrire les tests auth (fichier complet)**

```js
// backend/tests/auth.test.js
jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('node-cron', () => ({ schedule: jest.fn() }));
jest.mock('../src/utils/osmImport', () => ({ syncGooglePlaces: jest.fn() }));
jest.mock('../src/config/socket', () => ({
  initSocket: jest.fn(),
  getIO: jest.fn(() => ({ emit: jest.fn(), to: jest.fn().mockReturnThis() })),
}));
jest.mock('../src/models/User');

const request = require('supertest');
const app     = require('../src/app');
const User    = require('../src/models/User');

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('crée un compte et retourne 201', async () => {
    User.findByEmail.mockResolvedValue({ rows: [] });
    User.create.mockResolvedValue({
      rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user' }],
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Alice', email: 'alice@test.com', password: 'Password1!' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('alice@test.com');
    expect(res.body.data.password_hash).toBeUndefined();
  });

  it('retourne 400 si email déjà utilisé', async () => {
    User.findByEmail.mockResolvedValue({
      rows: [{ id: 1, email: 'alice@test.com' }],
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Alice', email: 'alice@test.com', password: 'Password1!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    // Message générique — ne révèle pas si l'email existe
    expect(res.body.message).not.toMatch(/email/i);
  });

  it('retourne 422 si body incomplet', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@test.com' }); // manque nom et password

    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  const bcrypt = require('bcryptjs');

  beforeEach(() => jest.clearAllMocks());

  it('retourne un token JWT valide', async () => {
    const hash = await bcrypt.hash('Password1!', 4);
    User.findByEmail.mockResolvedValue({
      rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user', password_hash: hash, is_active: true }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'Password1!' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  it('retourne 401 si mot de passe incorrect', async () => {
    const hash = await bcrypt.hash('AutreMotDePasse!', 4);
    User.findByEmail.mockResolvedValue({
      rows: [{ id: 1, email: 'alice@test.com', password_hash: hash, is_active: true }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'MauvaisPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.data).toBeUndefined();
  });

  it('retourne 401 si utilisateur inconnu', async () => {
    User.findByEmail.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@test.com', password: 'Password1!' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  const jwt = require('jsonwebtoken');
  const { env } = require('../src/config/env');

  beforeEach(() => jest.clearAllMocks());

  it('retourne le profil si JWT valide', async () => {
    const token = jwt.sign({ userId: 1, role: 'user' }, env.JWT_SECRET, { expiresIn: '1h' });
    User.findById.mockResolvedValue({
      rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user' }],
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(1);
  });

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/auth/password', () => {
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs');
  const { env } = require('../src/config/env');

  beforeEach(() => jest.clearAllMocks());

  it('met à jour le mot de passe si currentPassword correct', async () => {
    const hash = await bcrypt.hash('OldPass1!', 4);
    const token = jwt.sign({ userId: 1, role: 'user' }, env.JWT_SECRET, { expiresIn: '1h' });
    User.findById.mockResolvedValue({
      rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user' }],
    });
    User.findByEmail.mockResolvedValue({
      rows: [{ id: 1, email: 'alice@test.com', password_hash: hash }],
    });
    User.updatePassword.mockResolvedValue({ rowCount: 1 });

    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'OldPass1!', newPassword: 'NewPass1!' });

    expect(res.status).toBe(200);
  });

  it('retourne 400 si currentPassword incorrect', async () => {
    const hash = await bcrypt.hash('OldPass1!', 4);
    const token = jwt.sign({ userId: 1, role: 'user' }, env.JWT_SECRET, { expiresIn: '1h' });
    User.findById.mockResolvedValue({
      rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user' }],
    });
    User.findByEmail.mockResolvedValue({
      rows: [{ id: 1, email: 'alice@test.com', password_hash: hash }],
    });

    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'MauvaisAncien!', newPassword: 'NewPass1!' });

    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2 : Vérifier que User.js exporte bien les méthodes mockées**

```bash
cd backend && grep "module.exports" src/models/User.js
```

Résultat attendu : `findByEmail`, `findById`, `create`, `updatePassword` doivent être présents.

- [ ] **Step 3 : Lancer les tests auth**

```bash
cd backend && npx jest tests/auth.test.js --verbose
```

Résultat attendu : 8 tests PASS.

- [ ] **Step 4 : Commit**

```bash
cd backend
git add tests/auth.test.js
git commit -m "test: add auth integration tests (register, login, me, password)"
```

---

## Task 3 : Tests DAB

**Files:**
- Create: `backend/tests/dab.test.js`

Mocks : `db`, `node-cron`, `osmImport`, `socket`, `models/DAB`, `models/Service`, `models/HistoriqueStatut`.

- [ ] **Step 1 : Écrire les tests DAB (fichier complet)**

```js
// backend/tests/dab.test.js
jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('node-cron', () => ({ schedule: jest.fn() }));
jest.mock('../src/utils/osmImport', () => ({ syncGooglePlaces: jest.fn() }));
jest.mock('../src/config/socket', () => ({
  initSocket: jest.fn(),
  getIO: jest.fn(() => ({ emit: jest.fn(), to: jest.fn().mockReturnThis() })),
}));
jest.mock('../src/models/DAB');
jest.mock('../src/models/Service');
jest.mock('../src/models/HistoriqueStatut');
jest.mock('../src/models/User');

const request  = require('supertest');
const jwt      = require('jsonwebtoken');
const app      = require('../src/app');
const DAB      = require('../src/models/DAB');
const Service  = require('../src/models/Service');
const HistoriqueStatut = require('../src/models/HistoriqueStatut');
const User     = require('../src/models/User');
const { env }  = require('../src/config/env');

const makeAdminToken = () =>
  jwt.sign({ userId: 99, role: 'admin' }, env.JWT_SECRET, { expiresIn: '1h' });

const makeUserToken = () =>
  jwt.sign({ userId: 1, role: 'user' }, env.JWT_SECRET, { expiresIn: '1h' });

const fakeDAB = {
  id: 1, nom: 'DAB Test', adresse: '1 rue Test', latitude: 36.7, longitude: 3.1,
  statut: 'actif', etat_communautaire: null, banque_id: 1, banque_nom: 'CPA',
  is_verified: true, type_lieu: 'atm', source: 'admin',
};

beforeEach(() => {
  jest.clearAllMocks();
  // authMiddleware appelle User.findById pour valider le token admin
  User.findById.mockResolvedValue({ rows: [{ id: 99, nom: 'Admin', email: 'admin@test.com', role: 'admin' }] });
  HistoriqueStatut.create.mockResolvedValue({ rows: [] });
});

describe('GET /api/dabs', () => {
  it('retourne la liste des DAB vérifiés', async () => {
    DAB.findAll.mockResolvedValue({ rows: [fakeDAB] });

    const res = await request(app).get('/api/dabs');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].nom).toBe('DAB Test');
  });

  it('accepte les filtres lat/lng/radius', async () => {
    DAB.findAll.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .get('/api/dabs')
      .query({ lat: '36.7', lng: '3.1', radius: '5' });

    expect(res.status).toBe(200);
    expect(DAB.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ lat: '36.7', lng: '3.1', radius: '5' })
    );
  });
});

describe('GET /api/dabs/nearby', () => {
  it('retourne les DAB proches triés par distance', async () => {
    DAB.findNearby.mockResolvedValue({ rows: [{ ...fakeDAB, distance_km: 0.5 }] });

    const res = await request(app)
      .get('/api/dabs/nearby')
      .query({ lat: '36.7', lng: '3.1' });

    expect(res.status).toBe(200);
    expect(res.body.data[0].distance_km).toBe(0.5);
  });

  it('retourne [] si aucun DAB proche', async () => {
    DAB.findNearby.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .get('/api/dabs/nearby')
      .query({ lat: '36.7', lng: '3.1' });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('GET /api/dabs/:id', () => {
  it('retourne le DAB avec ses services', async () => {
    DAB.findById.mockResolvedValue({ rows: [fakeDAB] });
    Service.findByDabId.mockResolvedValue({ rows: [{ id: 1, nom: 'Retrait' }] });

    const res = await request(app).get('/api/dabs/1');

    expect(res.status).toBe(200);
    expect(res.body.data.services).toHaveLength(1);
  });

  it('retourne 404 si DAB inexistant', async () => {
    DAB.findById.mockResolvedValue({ rows: [] });

    const res = await request(app).get('/api/dabs/999');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/dabs (admin)', () => {
  it('crée un DAB et retourne 201', async () => {
    DAB.create.mockResolvedValue({ rows: [{ ...fakeDAB, id: 2 }] });

    const res = await request(app)
      .post('/api/dabs')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ nom: 'Nouveau DAB', latitude: 36.75, longitude: 3.05, banque_id: 1 });

    expect(res.status).toBe(201);
    expect(HistoriqueStatut.create).toHaveBeenCalledTimes(1);
  });

  it('retourne 403 pour un utilisateur non-admin', async () => {
    User.findById.mockResolvedValue({ rows: [{ id: 1, role: 'user' }] });

    const res = await request(app)
      .post('/api/dabs')
      .set('Authorization', `Bearer ${makeUserToken()}`)
      .send({ nom: 'Nouveau DAB', latitude: 36.75, longitude: 3.05 });

    expect(res.status).toBe(403);
  });

  it('retourne 401 sans token', async () => {
    const res = await request(app)
      .post('/api/dabs')
      .send({ nom: 'Nouveau DAB', latitude: 36.75, longitude: 3.05 });

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/dabs/:id (admin)', () => {
  it('met à jour un DAB existant', async () => {
    DAB.findById.mockResolvedValue({ rows: [fakeDAB] });
    DAB.update.mockResolvedValue({ rows: [{ ...fakeDAB, nom: 'DAB Modifié' }] });

    const res = await request(app)
      .put('/api/dabs/1')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ nom: 'DAB Modifié' });

    expect(res.status).toBe(200);
    expect(res.body.data.nom).toBe('DAB Modifié');
  });

  it('retourne 404 si DAB inexistant', async () => {
    DAB.findById.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .put('/api/dabs/999')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ nom: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/dabs/:id (admin)', () => {
  it('supprime un DAB existant', async () => {
    DAB.findById.mockResolvedValue({ rows: [fakeDAB] });
    DAB.remove.mockResolvedValue({ rows: [{ id: 1 }] });

    const res = await request(app)
      .delete('/api/dabs/1')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(200);
  });
});

describe('POST /api/dabs/proposer (anonyme)', () => {
  it('soumet une proposition et retourne 201', async () => {
    DAB.propose.mockResolvedValue({ rows: [{ ...fakeDAB, is_verified: false, source: 'communaute' }] });

    const res = await request(app)
      .post('/api/dabs/proposer')
      .send({ nom: 'DAB Proposé', latitude: 36.7, longitude: 3.1, type_lieu: 'atm' });

    expect(res.status).toBe(201);
    expect(res.body.data.is_verified).toBe(false);
  });
});

describe('GET /api/dabs/propositions (admin)', () => {
  it('retourne la liste des propositions non vérifiées', async () => {
    DAB.findPropositions.mockResolvedValue({ rows: [{ ...fakeDAB, is_verified: false }] });

    const res = await request(app)
      .get('/api/dabs/propositions')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/dabs/propositions/:id/approuver (admin)', () => {
  it('approuve une proposition', async () => {
    DAB.approuverProposition.mockResolvedValue({ rows: [{ ...fakeDAB, is_verified: true }] });

    const res = await request(app)
      .post('/api/dabs/propositions/1/approuver')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(200);
    expect(HistoriqueStatut.create).toHaveBeenCalledTimes(1);
  });

  it('retourne 404 si proposition inexistante', async () => {
    DAB.approuverProposition.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/dabs/propositions/999/approuver')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/dabs/propositions/:id/rejeter (admin)', () => {
  it('rejette et supprime une proposition', async () => {
    DAB.rejeterProposition.mockResolvedValue({ rows: [{ id: 1 }] });

    const res = await request(app)
      .delete('/api/dabs/propositions/1/rejeter')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2 : Lancer les tests DAB**

```bash
cd backend && npx jest tests/dab.test.js --verbose
```

Résultat attendu : ~14 tests PASS.

- [ ] **Step 3 : Commit**

```bash
cd backend
git add tests/dab.test.js
git commit -m "test: add DAB integration tests (CRUD + propositions)"
```

---

## Task 4 : Tests Avis

**Files:**
- Create: `backend/tests/avis.test.js`

- [ ] **Step 1 : Écrire les tests avis (fichier complet)**

```js
// backend/tests/avis.test.js
jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('node-cron', () => ({ schedule: jest.fn() }));
jest.mock('../src/utils/osmImport', () => ({ syncGooglePlaces: jest.fn() }));
jest.mock('../src/config/socket', () => ({
  initSocket: jest.fn(),
  getIO: jest.fn(() => ({ emit: jest.fn(), to: jest.fn().mockReturnThis() })),
}));
jest.mock('../src/models/Avis');
jest.mock('../src/models/DAB');
jest.mock('../src/models/User');

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const app     = require('../src/app');
const Avis    = require('../src/models/Avis');
const DAB     = require('../src/models/DAB');
const User    = require('../src/models/User');
const { env } = require('../src/config/env');

const makeToken = (id = 1, role = 'user') =>
  jwt.sign({ userId: id, role }, env.JWT_SECRET, { expiresIn: '1h' });

const fakeDAB = { id: 1, nom: 'DAB Test', statut: 'actif', is_verified: true };
const fakeAvis = { id: 10, dab_id: 1, user_id: 1, note: 4, commentaire: 'Bien', created_at: new Date().toISOString() };

beforeEach(() => {
  jest.clearAllMocks();
  User.findById.mockResolvedValue({ rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user' }] });
});

describe('GET /api/dabs/:id/avis', () => {
  it('retourne les avis et les stats du DAB', async () => {
    Avis.findByDabId.mockResolvedValue({ rows: [fakeAvis] });
    Avis.getStats.mockResolvedValue({ rows: [{ avg_note: '4.00', total: 1 }] });

    const res = await request(app).get('/api/dabs/1/avis');

    expect(res.status).toBe(200);
    expect(res.body.data.avis).toHaveLength(1);
    expect(res.body.data.stats.total).toBe(1);
  });
});

describe('POST /api/dabs/:id/avis', () => {
  it('crée un avis pour un utilisateur authentifié', async () => {
    DAB.findById.mockResolvedValue({ rows: [fakeDAB] });
    Avis.findByDabAndUser.mockResolvedValue({ rows: [] });
    Avis.create.mockResolvedValue({ rows: [fakeAvis] });

    const res = await request(app)
      .post('/api/dabs/1/avis')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ note: 4, commentaire: 'Bien' });

    expect(res.status).toBe(201);
    expect(res.body.data.note).toBe(4);
  });

  it('retourne 409 si avis déjà existant pour ce DAB', async () => {
    DAB.findById.mockResolvedValue({ rows: [fakeDAB] });
    Avis.findByDabAndUser.mockResolvedValue({ rows: [fakeAvis] });

    const res = await request(app)
      .post('/api/dabs/1/avis')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ note: 3, commentaire: 'Doublon' });

    expect(res.status).toBe(409);
  });

  it('retourne 404 si le DAB n\'existe pas', async () => {
    DAB.findById.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/dabs/999/avis')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ note: 3, commentaire: 'Test' });

    expect(res.status).toBe(404);
  });

  it('retourne 401 sans authentification', async () => {
    const res = await request(app)
      .post('/api/dabs/1/avis')
      .send({ note: 4, commentaire: 'Test' });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/dabs/:id/avis/:avisId', () => {
  it('permet au propriétaire de supprimer son avis', async () => {
    Avis.findById.mockResolvedValue({ rows: [fakeAvis] }); // user_id: 1
    Avis.remove.mockResolvedValue({ rowCount: 1 });

    const res = await request(app)
      .delete('/api/dabs/1/avis/10')
      .set('Authorization', `Bearer ${makeToken(1)}`); // même user_id

    expect(res.status).toBe(200);
  });

  it('permet à un admin de supprimer n\'importe quel avis', async () => {
    User.findById.mockResolvedValue({ rows: [{ id: 99, nom: 'Admin', email: 'admin@test.com', role: 'admin' }] });
    Avis.findById.mockResolvedValue({ rows: [{ ...fakeAvis, user_id: 1 }] }); // appartient à user 1
    Avis.remove.mockResolvedValue({ rowCount: 1 });

    const adminToken = jwt.sign({ userId: 99, role: 'admin' }, env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .delete('/api/dabs/1/avis/10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('retourne 403 si non propriétaire et non admin', async () => {
    User.findById.mockResolvedValue({ rows: [{ id: 2, nom: 'Bob', email: 'bob@test.com', role: 'user' }] });
    Avis.findById.mockResolvedValue({ rows: [{ ...fakeAvis, user_id: 1 }] }); // appartient à user 1

    const otherUserToken = jwt.sign({ userId: 2, role: 'user' }, env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .delete('/api/dabs/1/avis/10')
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
  });

  it('retourne 404 si avis inexistant', async () => {
    Avis.findById.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .delete('/api/dabs/1/avis/999')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2 : Lancer les tests avis**

```bash
cd backend && npx jest tests/avis.test.js --verbose
```

Résultat attendu : 8 tests PASS.

- [ ] **Step 3 : Commit**

```bash
cd backend
git add tests/avis.test.js
git commit -m "test: add avis integration tests (CRUD, ownership, auth)"
```

---

## Task 5 : Tests Signalement

**Files:**
- Create: `backend/tests/signalement.test.js`

- [ ] **Step 1 : Écrire les tests signalement (fichier complet)**

```js
// backend/tests/signalement.test.js
jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('node-cron', () => ({ schedule: jest.fn() }));
jest.mock('../src/utils/osmImport', () => ({ syncGooglePlaces: jest.fn() }));

const mockEmit = jest.fn();
const mockTo   = jest.fn().mockReturnThis();
jest.mock('../src/config/socket', () => ({
  initSocket: jest.fn(),
  getIO: jest.fn(() => ({ emit: mockEmit, to: mockTo })),
}));

jest.mock('../src/models/Signalement');
jest.mock('../src/models/DAB');
jest.mock('../src/models/HistoriqueStatut');
jest.mock('../src/models/User');

const request      = require('supertest');
const jwt          = require('jsonwebtoken');
const app          = require('../src/app');
const Signalement  = require('../src/models/Signalement');
const DAB          = require('../src/models/DAB');
const HistoriqueStatut = require('../src/models/HistoriqueStatut');
const User         = require('../src/models/User');
const { env }      = require('../src/config/env');

const makeAdminToken = () =>
  jwt.sign({ userId: 99, role: 'admin' }, env.JWT_SECRET, { expiresIn: '1h' });

const fakeDAB = {
  id: 1, nom: 'DAB Test', statut: 'actif', is_verified: true,
  etat_communautaire: null, nb_votes_actifs: 0,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockEmit.mockClear();
  HistoriqueStatut.create.mockResolvedValue({ rows: [] });
  User.findById.mockResolvedValue({ rows: [{ id: 99, nom: 'Admin', email: 'admin@test.com', role: 'admin' }] });
});

describe('GET /api/dabs/:id/signalements', () => {
  it('retourne les votes actifs groupés par état', async () => {
    Signalement.getActiveVotes.mockResolvedValue({
      rows: [
        { etat: 'disponible', count: 3 },
        { etat: 'vide', count: 1 },
      ],
    });

    const res = await request(app).get('/api/dabs/1/signalements');

    expect(res.status).toBe(200);
    expect(res.body.data.votes.disponible).toBe(3);
    expect(res.body.data.votes.vide).toBe(1);
    expect(res.body.data.votes.en_panne).toBe(0);
    expect(res.body.data.totalVotes).toBe(4);
  });
});

describe('POST /api/dabs/:id/signalements (anonyme)', () => {
  it('enregistre un signalement et retourne les votes mis à jour', async () => {
    DAB.findById.mockResolvedValue({ rows: [fakeDAB] });
    Signalement.findExisting.mockResolvedValue({ rows: [] });
    Signalement.create.mockResolvedValue({ rows: [] });
    Signalement.getActiveVotes.mockResolvedValue({
      rows: [{ etat: 'disponible', count: 1 }],
    });
    DAB.updateNbVotes.mockResolvedValue({});

    const res = await request(app)
      .post('/api/dabs/1/signalements')
      .send({ etat: 'disponible', cookieId: 'uuid-test-1234' });

    expect(res.status).toBe(201);
    expect(res.body.data.votes.disponible).toBe(1);
    expect(res.body.data.totalVotes).toBe(1);
    expect(mockEmit).toHaveBeenCalledWith('dab_update', expect.objectContaining({ dabId: 1 }));
  });

  it('retourne 429 si déjà signalé (anti-spam)', async () => {
    DAB.findById.mockResolvedValue({ rows: [fakeDAB] });
    Signalement.findExisting.mockResolvedValue({
      rows: [{ id: 5, dab_id: 1, etat: 'vide' }], // vote existant
    });

    const res = await request(app)
      .post('/api/dabs/1/signalements')
      .send({ etat: 'vide', cookieId: 'uuid-test-1234' });

    expect(res.status).toBe(429);
    expect(Signalement.create).not.toHaveBeenCalled();
  });

  it('retourne 404 si le DAB n\'existe pas', async () => {
    DAB.findById.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/dabs/999/signalements')
      .send({ etat: 'disponible', cookieId: 'uuid-test-1234' });

    expect(res.status).toBe(404);
  });

  it('met à jour etat_communautaire quand le seuil est atteint', async () => {
    // SIGNALEMENT_SEUIL = 2 (défini dans setup.js)
    DAB.findById.mockResolvedValue({ rows: [{ ...fakeDAB, etat_communautaire: null }] });
    Signalement.findExisting.mockResolvedValue({ rows: [] });
    Signalement.create.mockResolvedValue({ rows: [] });
    // 2 votes "vide" → seuil atteint
    Signalement.getActiveVotes.mockResolvedValue({
      rows: [{ etat: 'vide', count: 2 }],
    });
    DAB.updateEtatCommunautaire.mockResolvedValue({});
    DAB.updateNbVotes.mockResolvedValue({});

    const res = await request(app)
      .post('/api/dabs/1/signalements')
      .send({ etat: 'vide', cookieId: 'uuid-test-5678' });

    expect(res.status).toBe(201);
    expect(DAB.updateEtatCommunautaire).toHaveBeenCalledWith('1', 'vide');
    expect(HistoriqueStatut.create).toHaveBeenCalledWith(
      '1', 'etat_communautaire', null, 'vide', 'communaute'
    );
    expect(mockTo).toHaveBeenCalledWith('dab_1');
  });

  it('n\'atteint pas le seuil avec 1 seul vote', async () => {
    DAB.findById.mockResolvedValue({ rows: [{ ...fakeDAB, etat_communautaire: null }] });
    Signalement.findExisting.mockResolvedValue({ rows: [] });
    Signalement.create.mockResolvedValue({ rows: [] });
    Signalement.getActiveVotes.mockResolvedValue({
      rows: [{ etat: 'en_panne', count: 1 }],
    });
    DAB.updateNbVotes.mockResolvedValue({});

    const res = await request(app)
      .post('/api/dabs/1/signalements')
      .send({ etat: 'en_panne', cookieId: 'uuid-test-9999' });

    expect(res.status).toBe(201);
    expect(DAB.updateEtatCommunautaire).not.toHaveBeenCalled();
  });
});

describe('POST /api/dabs/:id/signalements/resoudre (admin)', () => {
  it('remet etat_communautaire à null et nb_votes à 0', async () => {
    DAB.findById.mockResolvedValue({ rows: [{ ...fakeDAB, etat_communautaire: 'vide' }] });
    DAB.updateEtatCommunautaire.mockResolvedValue({});
    DAB.updateNbVotes.mockResolvedValue({});

    const res = await request(app)
      .post('/api/dabs/1/signalements/resoudre')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(200);
    expect(DAB.updateEtatCommunautaire).toHaveBeenCalledWith('1', null);
    expect(DAB.updateNbVotes).toHaveBeenCalledWith('1', 0);
    expect(mockEmit).toHaveBeenCalledWith('dab_update', expect.objectContaining({
      dabId: 1, etatCommunautaire: null, totalVotes: 0,
    }));
  });

  it('retourne 404 si DAB inexistant', async () => {
    DAB.findById.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/dabs/999/signalements/resoudre')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(404);
  });

  it('retourne 401 sans token', async () => {
    const res = await request(app)
      .post('/api/dabs/1/signalements/resoudre');

    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2 : Lancer les tests signalement**

```bash
cd backend && npx jest tests/signalement.test.js --verbose
```

Résultat attendu : 9 tests PASS.

- [ ] **Step 3 : Commit**

```bash
cd backend
git add tests/signalement.test.js
git commit -m "test: add signalement integration tests (vote, anti-spam, seuil, résolution)"
```

---

## Task 6 : Lancer la suite complète et vérifier

- [ ] **Step 1 : Lancer tous les tests**

```bash
cd backend && npm test
```

Résultat attendu : ~39 tests PASS, 0 FAIL, 0 SKIP.

- [ ] **Step 2 : Vérifier la couverture (optionnel)**

```bash
cd backend && npx jest --coverage
```

Résultat attendu : controllers/ et models/ couverts à 70%+.

- [ ] **Step 3 : Commit final**

```bash
cd backend
git add .
git commit -m "test: all backend integration tests passing"
```

---

## Auto-review

### Couverture spec
- ✅ `POST /api/auth/register` — Task 2
- ✅ `POST /api/auth/login` — Task 2
- ✅ `GET /api/auth/me` — Task 2
- ✅ `PUT /api/auth/password` — Task 2
- ✅ `GET /api/dabs` — Task 3
- ✅ `GET /api/dabs/nearby` — Task 3
- ✅ `GET /api/dabs/:id` — Task 3
- ✅ `POST /api/dabs` (admin) — Task 3
- ✅ `PUT /api/dabs/:id` (admin) — Task 3
- ✅ `DELETE /api/dabs/:id` (admin) — Task 3
- ✅ `POST /api/dabs/proposer` — Task 3
- ✅ `GET /api/dabs/propositions` (admin) — Task 3
- ✅ `POST /api/dabs/propositions/:id/approuver` (admin) — Task 3
- ✅ `DELETE /api/dabs/propositions/:id/rejeter` (admin) — Task 3
- ✅ `GET /api/dabs/:id/avis` — Task 4
- ✅ `POST /api/dabs/:id/avis` (JWT) — Task 4
- ✅ `DELETE /api/dabs/:id/avis/:avisId` (owner ou admin) — Task 4
- ✅ `GET /api/dabs/:id/signalements` — Task 5
- ✅ `POST /api/dabs/:id/signalements` (anonyme, anti-spam, seuil) — Task 5
- ✅ `POST /api/dabs/:id/signalements/resoudre` (admin) — Task 5

### Points d'attention
- `BCRYPT_ROUNDS=4` dans setup.js → les tests de login sont ~10x plus rapides qu'en production (rounds=12)
- `mockTo` renvoie `this` pour chaîner `.to('dab_1').emit(...)` sans erreur
- `User.findById` est mocké dans `beforeEach` de chaque suite car `authMiddleware` l'appelle pour valider le JWT
