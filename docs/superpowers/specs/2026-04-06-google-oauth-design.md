# Design — Authentification Google OAuth (Passport.js)

**Date** : 2026-04-06
**Projet** : LocalisationDAB
**Scope** : Google OAuth uniquement (Facebook prévu en phase suivante)

---

## Contexte

L'application utilise déjà une auth email/password avec JWT. On ajoute Google OAuth comme méthode de connexion alternative, en conservant le JWT comme token de session côté frontend.

---

## Approche retenue

**Passport.js + stratégie `passport-google-oauth20`**

Standard Express, extensible à Facebook, s'intègre proprement avec le JWT existant.

---

## Flux complet

```
1. Utilisateur clique "Se connecter avec Google"
2. Frontend → GET /api/auth/google
3. Backend redirige vers Google (OAuth consent screen)
4. Utilisateur accepte
5. Google → GET /api/auth/google/callback?code=...
6. Backend échange le code contre un profil Google (googleId, email, nom, avatar)
7. findOrCreateGoogle() :
   - email déjà en BDD → récupère l'utilisateur existant
   - email inconnu → crée un nouveau compte (password_hash = NULL)
8. Backend génère un JWT signé
9. Redirect vers http://localhost:5173/auth/callback?token=JWT
10. Frontend lit le token, le stocke dans localStorage, redirige vers "/"
```

---

## Base de données

Migration `003_add_oauth.sql` :

```sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
```

- `google_id` : identifiant unique Google (sub), nullable pour les comptes email/password
- `avatar_url` : photo de profil Google, nullable
- `password_hash` reste NULL pour les comptes OAuth

---

## Backend

### Nouveaux packages
- `passport`
- `passport-google-oauth20`

### Variables d'environnement (.env)
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FRONTEND_URL=http://localhost:5173
```

### Fichiers

| Fichier | Modification |
|---|---|
| `src/config/passport.js` | Nouveau — GoogleStrategy, findOrCreateGoogle |
| `src/routes/authRoutes.js` | +2 routes : GET /google, GET /google/callback |
| `src/models/User.js` | +méthode findOrCreateGoogle(googleId, email, nom, avatarUrl) |
| `src/app.js` | Initialisation passport (sans session) |
| `.env` | +GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL |
| `migrations/003_add_oauth.sql` | Migration colonnes google_id + avatar_url |

### Routes
```
GET /api/auth/google
  → passport.authenticate('google', { scope: ['profile', 'email'] })

GET /api/auth/google/callback
  → passport.authenticate + génération JWT + redirect frontend
```

### Sécurité
- Passport utilisé sans session (`session: false`) — JWT suffit
- `state` parameter activé via Passport pour protection CSRF
- En cas d'erreur OAuth → redirect vers `/login?error=oauth`

---

## Frontend

### Nouveaux fichiers
- `src/pages/AuthCallback.jsx` — lit `?token=` dans l'URL, stocke le JWT, redirige vers `/`

### Fichiers modifiés
- `src/pages/LoginPage.jsx` — bouton "Se connecter avec Google"
- `src/pages/RegisterPage.jsx` — bouton "Se connecter avec Google"
- `src/App.jsx` — route `/auth/callback` → `<AuthCallback />`

### Bouton Google
Lien simple `<a href="http://localhost:5000/api/auth/google">` (pas de fetch — redirection navigateur complète).

---

## Prérequis utilisateur (Google Cloud Console)

1. Créer un projet sur [console.cloud.google.com](https://console.cloud.google.com)
2. Activer l'API **Google+ API** ou **People API**
3. Créer des identifiants OAuth 2.0 (type : Application Web)
4. Ajouter les URIs autorisés :
   - Origine : `http://localhost:5000`
   - Callback : `http://localhost:5000/api/auth/google/callback`
5. Copier `Client ID` et `Client Secret` dans `.env`

---

## Ce qui n'est PAS dans ce scope

- Authentification Facebook (phase suivante)
- Liaison d'un compte Google à un compte email/password existant
- Déconnexion OAuth spécifique (le logout JWT suffit)
- HTTPS / production (à prévoir lors du déploiement)
