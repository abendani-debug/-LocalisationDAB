-- =============================================================
-- 001_init.sql — Initialisation de la base de données LocalisationDAB
-- Ne jamais modifier ce fichier → créer 002_*.sql pour toute évolution
-- =============================================================

-- Extension UUID (optionnel, on utilise SERIAL ici)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- TABLE : users
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  nom           VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- TABLE : banques
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banques (
  id         SERIAL PRIMARY KEY,
  nom        VARCHAR(100) NOT NULL UNIQUE,
  logo_url   VARCHAR(500),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- TABLE : dabs
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dabs (
  id                    SERIAL PRIMARY KEY,
  nom                   VARCHAR(255) NOT NULL,
  adresse               TEXT,
  latitude              DECIMAL(10, 7) NOT NULL,
  longitude             DECIMAL(10, 7) NOT NULL,
  statut                VARCHAR(20)  NOT NULL DEFAULT 'actif'
                          CHECK (statut IN ('actif', 'hors_service', 'maintenance')),
  etat_communautaire    VARCHAR(20)  DEFAULT NULL
                          CHECK (etat_communautaire IN ('disponible', 'vide', 'en_panne')),
  etat_communautaire_at TIMESTAMPTZ  DEFAULT NULL,
  nb_votes_actifs       INTEGER      NOT NULL DEFAULT 0,
  banque_id             INTEGER      REFERENCES banques(id) ON DELETE SET NULL,
  osm_id                VARCHAR(50)  UNIQUE,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dabs_location ON dabs (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_dabs_statut   ON dabs (statut);
CREATE INDEX IF NOT EXISTS idx_dabs_banque   ON dabs (banque_id);

-- -------------------------------------------------------------
-- TABLE : services
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id          SERIAL PRIMARY KEY,
  nom         VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- TABLE : dab_services (pivot)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dab_services (
  dab_id     INTEGER NOT NULL REFERENCES dabs(id)     ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (dab_id, service_id)
);

-- -------------------------------------------------------------
-- TABLE : avis
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS avis (
  id         SERIAL PRIMARY KEY,
  dab_id     INTEGER      NOT NULL REFERENCES dabs(id)  ON DELETE CASCADE,
  user_id    INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note       SMALLINT     NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (dab_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_avis_dab  ON avis (dab_id);
CREATE INDEX IF NOT EXISTS idx_avis_user ON avis (user_id);

-- -------------------------------------------------------------
-- TABLE : signalements
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signalements (
  id          SERIAL PRIMARY KEY,
  dab_id      INTEGER     NOT NULL REFERENCES dabs(id) ON DELETE CASCADE,
  etat        VARCHAR(20) NOT NULL
                CHECK (etat IN ('disponible', 'vide', 'en_panne')),
  ip_hash     VARCHAR(64) NOT NULL,   -- SHA-256 salé, jamais l'IP brute
  cookie_id   VARCHAR(36) NOT NULL,   -- UUID côté client
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL,   -- created_at + SIGNALEMENT_DUREE_HEURES
  UNIQUE (dab_id, ip_hash),
  UNIQUE (dab_id, cookie_id)
);

CREATE INDEX IF NOT EXISTS idx_signalements_dab     ON signalements (dab_id);
CREATE INDEX IF NOT EXISTS idx_signalements_expires ON signalements (expires_at);

-- -------------------------------------------------------------
-- TABLE : historique_statuts
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historique_statuts (
  id          SERIAL PRIMARY KEY,
  dab_id      INTEGER     NOT NULL REFERENCES dabs(id) ON DELETE CASCADE,
  champ       VARCHAR(30) NOT NULL,   -- 'statut' ou 'etat_communautaire'
  ancienne_valeur VARCHAR(30),
  nouvelle_valeur VARCHAR(30),
  source      VARCHAR(20) NOT NULL DEFAULT 'systeme'
                CHECK (source IN ('admin', 'communaute', 'systeme', 'osm')),
  user_id     INTEGER     REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historique_dab ON historique_statuts (dab_id);

-- -------------------------------------------------------------
-- TRIGGER : updated_at automatique
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_dabs_updated_at
  BEFORE UPDATE ON dabs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_avis_updated_at
  BEFORE UPDATE ON avis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
