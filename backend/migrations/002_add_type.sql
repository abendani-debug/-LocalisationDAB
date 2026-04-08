-- =============================================================
-- 002_add_type.sql — Ajout colonne type sur la table dabs
-- Distingue les DAB/ATM des agences bancaires (import Google Places)
-- =============================================================

ALTER TABLE dabs
  ADD COLUMN IF NOT EXISTS type VARCHAR(10) NOT NULL DEFAULT 'atm'
    CHECK (type IN ('atm', 'bank'));

CREATE INDEX IF NOT EXISTS idx_dabs_type ON dabs (type);
