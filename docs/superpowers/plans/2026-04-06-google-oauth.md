# Google OAuth (Passport.js) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter la connexion via Google à LocalisationDAB en conservant le JWT comme token de session.

**Architecture:** Passport.js gère le flux OAuth2 Google. Une session express minimale (5 min TTL) stocke le state OAuth temporairement. Après le callback Google, le backend génère un JWT et redirige le frontend vers `/auth/callback?token=JWT`. Le frontend stocke le token et appelle `getMe()` pour récupérer les données utilisateur.

**Tech Stack:** `passport`, `passport-google-oauth20`, `express-session`, React Router, AuthContext existant.

---

## Fichiers concernés

| Fichier | Action |
|---|---|
| `backend/migrations/003_add_oauth.sql` | Créer — colonnes google_id + avatar_url |
| `backend/.env` | Modifier — ajouter GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL |
| `backend/src/config/env.js` | Modifier — exposer les 3 nouvelles vars |
| `backend/src/models/User.js` | Modifier — ajouter findOrCreateGoogle() |
| `backend/src/config/passport.js` | Créer — GoogleStrategy + serialize/deserialize |
| `backend/src/app.js` | Modifier — session + passport.initialize() |
| `backend/src/routes/authRoutes.js` | Modifier — routes /google et /google/callback |
| `frontend/src/pages/AuthCallback.jsx` | Créer — lit token depuis URL, appelle login() |
| `frontend/src/App.jsx` | Modifier — route /auth/callback |
| `frontend/src/pages/LoginPage.jsx` | Modifier — bouton Google |
| `frontend/src/pages/RegisterPage.jsx` | Modifier — bouton Google |

---

## Task 1 : Migration SQL + variables d'environnement

**Files:**
- Create: `backend/migrations/003_add_oauth.sql`
- Modify: `backend/.env`
- Modify: `backend/src/config/env.js`

- [ ] **Step 1 : Créer la migration SQL**

Créer `backend/migrations/003_add_oauth.sql` :

```sql
-- Migration 003 : Ajout colonnes OAuth
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
```

- [ ] **Step 2 : Exécuter la migration**

```bash
psql "postgresql://postgres:Welcome2026@localhost:5432/localisation_dab" -f migrations/003_add_oauth.sql
```

Résultat attendu :
```
ALTER TABLE
ALTER TABLE
```

- [ ] **Step 3 : Vérifier les colonnes**

```bash
psql "postgresql://postgres:Welcome2026@localhost:5432/localisation_dab" -c "\d users"
```

Vérifier que `google_id` et `avatar_url` apparaissent dans la liste.

- [ ] **Step 4 : Ajouter les variables dans .env**

Ajouter à la fin de `backend/.env` :

```
GOOGLE_CLIENT_ID=COLLER_ICI_LE_CLIENT_ID
GOOGLE_CLIENT_SECRET=COLLER_ICI_LE_CLIENT_SECRET
FRONTEND_URL=http://localhost:5173
```

> **Note :** Pour obtenir ces valeurs → Google Cloud Console > APIs & Services > Credentials > Create OAuth 2.0 Client ID
> - Type : Web Application
> - Authorized redirect URIs : `http://localhost:5000/api/auth/google/callback`

- [ ] **Step 5 : Exposer les vars dans env.js**

Modifier `backend/src/config/env.js`, ajouter dans l'objet `env` :

```js
  GOOGLE_CLIENT_ID:     required('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: required('GOOGLE_CLIENT_SECRET'),
  FRONTEND_URL:         process.env.FRONTEND_URL || 'http://localhost:5173',
```

- [ ] **Step 6 : Installer les packages**

```bash
cd backend && npm install passport passport-google-oauth20 express-session
```

Résultat attendu : `added X packages` sans erreur.

- [ ] **Step 7 : Commit**

```bash
git add migrations/003_add_oauth.sql src/config/env.js
git commit -m "feat: migration OAuth + vars env Google"
```

---

## Task 2 : Méthode findOrCreateGoogle dans le modèle User

**Files:**
- Modify: `backend/src/models/User.js`

- [ ] **Step 1 : Tester manuellement que les colonnes existent**

```bash
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Welcome2026@localhost:5432/localisation_dab' });
pool.query('SELECT id, google_id, avatar_url FROM users LIMIT 1').then(r => { console.log('OK', r.fields.map(f=>f.name)); pool.end(); });
"
```

Résultat attendu : `OK [ 'id', 'google_id', 'avatar_url' ]`

- [ ] **Step 2 : Ajouter findOrCreateGoogle dans User.js**

Dans `backend/src/models/User.js`, ajouter avant `module.exports` :

```js
const findOrCreateGoogle = async (googleId, email, nom, avatarUrl) => {
  // 1. Chercher par google_id (reconnexion)
  const byGoogleId = await db.query(
    'SELECT id, nom, email, role, is_active, avatar_url FROM users WHERE google_id = $1',
    [googleId]
  );
  if (byGoogleId.rows.length > 0) return byGoogleId.rows[0];

  // 2. Chercher par email (lier un compte existant)
  const byEmail = await db.query(
    'SELECT id, nom, email, role, is_active, avatar_url FROM users WHERE email = $1',
    [email]
  );
  if (byEmail.rows.length > 0) {
    const updated = await db.query(
      'UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3 RETURNING id, nom, email, role, is_active, avatar_url',
      [googleId, avatarUrl, byEmail.rows[0].id]
    );
    return updated.rows[0];
  }

  // 3. Créer un nouveau compte
  const created = await db.query(
    `INSERT INTO users (nom, email, google_id, avatar_url, role)
     VALUES ($1, $2, $3, $4, 'user')
     RETURNING id, nom, email, role, is_active, avatar_url`,
    [nom, email, googleId, avatarUrl]
  );
  return created.rows[0];
};
```

Et ajouter `findOrCreateGoogle` dans le `module.exports` :

```js
module.exports = { findByEmail, findById, create, updatePassword, findOrCreateGoogle };
```

- [ ] **Step 3 : Tester findOrCreateGoogle manuellement**

```bash
node -e "
require('dotenv').config();
const User = require('./src/models/User');
User.findOrCreateGoogle('google_test_123', 'oauth_test@gmail.com', 'Test OAuth', null)
  .then(u => { console.log('Créé/trouvé :', u.email, u.role); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
"
```

Résultat attendu : `Créé/trouvé : oauth_test@gmail.com user`

- [ ] **Step 4 : Nettoyer l'utilisateur de test**

```bash
psql "postgresql://postgres:Welcome2026@localhost:5432/localisation_dab" -c "DELETE FROM users WHERE email = 'oauth_test@gmail.com';"
```

- [ ] **Step 5 : Commit**

```bash
git add src/models/User.js
git commit -m "feat: User.findOrCreateGoogle — création/liaison compte OAuth"
```

---

## Task 3 : Configuration Passport.js

**Files:**
- Create: `backend/src/config/passport.js`

- [ ] **Step 1 : Créer src/config/passport.js**

```js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { env } = require('./env');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await User.findById(id);
    done(null, result.rows[0] || false);
  } catch (err) {
    done(err);
  }
});

passport.use(new GoogleStrategy(
  {
    clientID:     env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL:  'http://localhost:5000/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email     = profile.emails?.[0]?.value;
      const nom       = profile.displayName || email;
      const avatarUrl = profile.photos?.[0]?.value || null;
      const user      = await User.findOrCreateGoogle(profile.id, email, nom, avatarUrl);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

module.exports = passport;
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node -e "require('dotenv').config(); require('./src/config/passport'); console.log('Passport OK');"
```

Résultat attendu : `Passport OK`

- [ ] **Step 3 : Commit**

```bash
git add src/config/passport.js
git commit -m "feat: config Passport GoogleStrategy"
```

---

## Task 4 : Session + Passport dans app.js et routes OAuth

**Files:**
- Modify: `backend/src/app.js`
- Modify: `backend/src/routes/authRoutes.js`

- [ ] **Step 1 : Ajouter session + passport dans app.js**

Dans `backend/src/app.js`, ajouter après les imports existants :

```js
const session  = require('express-session');
const passport = require('./config/passport');
```

Puis ajouter après `app.use(cors(...))` et avant `app.use(express.json(...))` :

```js
// ── Session OAuth (utilisée uniquement pour le flux Google) ──
app.use(session({
  secret:            env.JWT_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie:            { secure: false, httpOnly: true, maxAge: 300000 }, // 5 min
}));
app.use(passport.initialize());
app.use(passport.session());
```

- [ ] **Step 2 : Ajouter les routes OAuth dans authRoutes.js**

Dans `backend/src/routes/authRoutes.js`, ajouter après les imports existants :

```js
const jwt      = require('jsonwebtoken');
const { env }  = require('../config/env');
const passport = require('../config/passport');
```

Puis ajouter après les routes existantes, avant `module.exports` :

```js
// ── Google OAuth ─────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${env.FRONTEND_URL}/login?error=oauth`,
  }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.id, role: req.user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);
```

- [ ] **Step 3 : Redémarrer le backend et tester la route**

Redémarrer le backend (`npm run dev`), puis :

```bash
curl -I http://localhost:5000/api/auth/google
```

Résultat attendu : `HTTP/1.1 302 Found` avec `Location: https://accounts.google.com/...`

- [ ] **Step 4 : Commit**

```bash
git add src/app.js src/routes/authRoutes.js
git commit -m "feat: routes OAuth Google + session express"
```

---

## Task 5 : Frontend — Page AuthCallback

**Files:**
- Create: `frontend/src/pages/AuthCallback.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1 : Créer AuthCallback.jsx**

Créer `frontend/src/pages/AuthCallback.jsx` :

```jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getMe } from '../api/authApi';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');

    if (!token) {
      navigate('/login?error=oauth');
      return;
    }

    localStorage.setItem('token', token);

    getMe()
      .then((res) => {
        login(token, res.data);
        navigate('/');
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login?error=oauth');
      });
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 'calc(100vh - 56px)', flexDirection: 'column', gap: '1rem',
      color: '#6b7280', fontSize: '0.95rem',
    }}>
      <div style={{
        width: 32, height: 32, border: '3px solid #e5e7eb',
        borderTop: '3px solid #1e40af', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      Connexion en cours…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
```

- [ ] **Step 2 : Ajouter la route dans App.jsx**

Dans `frontend/src/App.jsx`, ajouter l'import :

```jsx
import AuthCallback from './pages/AuthCallback';
```

Puis dans `<Routes>`, ajouter après la route `/register` :

```jsx
<Route path="/auth/callback" element={<AuthCallback />} />
```

- [ ] **Step 3 : Vérifier que Vite recompile sans erreur**

Observer le terminal frontend — aucune erreur de compilation.

- [ ] **Step 4 : Commit**

```bash
git add src/pages/AuthCallback.jsx src/App.jsx
git commit -m "feat: page AuthCallback — réception token OAuth"
```

---

## Task 6 : Frontend — Bouton Google sur Login et Register

**Files:**
- Modify: `frontend/src/pages/LoginPage.jsx`
- Modify: `frontend/src/pages/RegisterPage.jsx`

- [ ] **Step 1 : Mettre à jour LoginPage.jsx**

Remplacer le contenu de `frontend/src/pages/LoginPage.jsx` :

```jsx
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';

const GOOGLE_AUTH_URL = 'http://localhost:5000/api/auth/google';

function GoogleButton() {
  return (
    <a
      href={GOOGLE_AUTH_URL}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.6rem', width: '100%', padding: '0.55rem',
        border: '1px solid #d1d5db', borderRadius: '0.375rem',
        background: '#fff', color: '#374151',
        fontSize: '0.88rem', fontWeight: 500,
        textDecoration: 'none', cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.08-6.08C34.52 3.19 29.54 1 24 1 14.82 1 7.05 6.48 3.53 14.27l7.07 5.49C12.3 13.59 17.69 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.22-.42-4.74H24v9h12.68c-.55 2.95-2.2 5.45-4.67 7.13l7.19 5.58C43.29 37.5 46.5 31.45 46.5 24.5z"/>
        <path fill="#FBBC05" d="M10.6 28.24A14.56 14.56 0 0 1 9.5 24c0-1.48.26-2.91.7-4.24L3.13 14.27A23.94 23.94 0 0 0 0 24c0 3.86.92 7.5 2.53 10.73l8.07-6.49z"/>
        <path fill="#34A853" d="M24 47c5.54 0 10.19-1.84 13.59-4.99l-7.19-5.58c-1.83 1.23-4.17 1.96-6.4 1.96-6.31 0-11.7-4.09-13.4-9.76l-7.07 5.49C7.05 41.52 14.82 47 24 47z"/>
      </svg>
      Continuer avec Google
    </a>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.4rem', textAlign: 'center' }}>Connexion</h1>
        <GoogleButton />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>ou</span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        </div>
        <LoginForm onSuccess={() => navigate('/')} />
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: '#1e40af' }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Mettre à jour RegisterPage.jsx**

Remplacer le contenu de `frontend/src/pages/RegisterPage.jsx` :

```jsx
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';

const GOOGLE_AUTH_URL = 'http://localhost:5000/api/auth/google';

function GoogleButton() {
  return (
    <a
      href={GOOGLE_AUTH_URL}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.6rem', width: '100%', padding: '0.55rem',
        border: '1px solid #d1d5db', borderRadius: '0.375rem',
        background: '#fff', color: '#374151',
        fontSize: '0.88rem', fontWeight: 500,
        textDecoration: 'none', cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.08-6.08C34.52 3.19 29.54 1 24 1 14.82 1 7.05 6.48 3.53 14.27l7.07 5.49C12.3 13.59 17.69 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.22-.42-4.74H24v9h12.68c-.55 2.95-2.2 5.45-4.67 7.13l7.19 5.58C43.29 37.5 46.5 31.45 46.5 24.5z"/>
        <path fill="#FBBC05" d="M10.6 28.24A14.56 14.56 0 0 1 9.5 24c0-1.48.26-2.91.7-4.24L3.13 14.27A23.94 23.94 0 0 0 0 24c0 3.86.92 7.5 2.53 10.73l8.07-6.49z"/>
        <path fill="#34A853" d="M24 47c5.54 0 10.19-1.84 13.59-4.99l-7.19-5.58c-1.83 1.23-4.17 1.96-6.4 1.96-6.31 0-11.7-4.09-13.4-9.76l-7.07 5.49C7.05 41.52 14.82 47 24 47z"/>
      </svg>
      Continuer avec Google
    </a>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.4rem', textAlign: 'center' }}>Créer un compte</h1>
        <GoogleButton />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>ou</span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        </div>
        <RegisterForm onSuccess={() => navigate('/login')} />
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: '#1e40af' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : Vérifier visuellement**

Ouvrir `http://localhost:5173/login` et `http://localhost:5173/register` — le bouton Google avec logo SVG doit apparaître au-dessus du formulaire, séparé par un diviseur "ou".

- [ ] **Step 4 : Commit final**

```bash
git add src/pages/LoginPage.jsx src/pages/RegisterPage.jsx
git commit -m "feat: bouton Google OAuth sur Login et Register"
```

---

## Checklist de test final

- [ ] Aller sur `http://localhost:5173/login`
- [ ] Cliquer "Continuer avec Google" → redirection vers Google
- [ ] Se connecter avec un compte Google
- [ ] Redirection vers `http://localhost:5173/auth/callback?token=...`
- [ ] Redirection automatique vers `/`
- [ ] Vérifier en base que l'utilisateur a `google_id` renseigné :

```bash
psql "postgresql://postgres:Welcome2026@localhost:5432/localisation_dab" -c "SELECT id, email, google_id, avatar_url FROM users WHERE google_id IS NOT NULL;"
```

---

## Prérequis avant de commencer

**Configurer Google Cloud Console :**

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créer un projet ou en sélectionner un existant
3. Menu → APIs & Services → OAuth consent screen → External → Remplir les champs obligatoires
4. Menu → APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type : **Web application**
   - Authorized JavaScript origins : `http://localhost:5000`
   - Authorized redirect URIs : `http://localhost:5000/api/auth/google/callback`
5. Copier le **Client ID** et le **Client Secret** dans `backend/.env`
