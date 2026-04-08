-- =============================================================
-- 002_add_community_dab.sql — Ajout colonnes propositions communautaires
-- Exécuter : psql $DATABASE_URL -f migrations/002_add_community_dab.sql
-- =============================================================

-- Colonnes ajoutées sur la table dabs
ALTER TABLE dabs
  ADD COLUMN IF NOT EXISTS source      VARCHAR(20) NOT NULL DEFAULT 'admin'
    CHECK (source IN ('admin', 'google_places', 'communaute')),
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN     NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS type_lieu   VARCHAR(20) NOT NULL DEFAULT 'atm'
    CHECK (type_lieu IN ('atm', 'agence'));

-- Index pour filtrer rapidement les propositions non vérifiées
CREATE INDEX IF NOT EXISTS idx_dabs_is_verified ON dabs (is_verified);
CREATE INDEX IF NOT EXISTS idx_dabs_source      ON dabs (source);
