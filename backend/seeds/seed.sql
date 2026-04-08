-- =============================================================
-- seed.sql — Données de test pour LocalisationDAB
-- À exécuter après migrations/001_init.sql
-- =============================================================

-- -------------------------------------------------------------
-- Banques
-- -------------------------------------------------------------
INSERT INTO banques (nom) VALUES
  ('CPA'),
  ('BNA'),
  ('BEA'),
  ('CNEP'),
  ('BADR'),
  ('BDL'),
  ('AGB'),
  ('Algerie Poste'),
  ('Société Générale Algérie'),
  ('BNP Paribas El Djazaïr'),
  ('Banque Salam')
ON CONFLICT (nom) DO NOTHING;

-- -------------------------------------------------------------
-- Services
-- -------------------------------------------------------------
INSERT INTO services (nom, description) VALUES
  ('retrait',   'Retrait d''espèces'),
  ('depot',     'Dépôt d''espèces'),
  ('virement',  'Virement bancaire'),
  ('solde',     'Consultation de solde'),
  ('pmr',       'Accès PMR (personnes à mobilité réduite)')
ON CONFLICT (nom) DO NOTHING;

-- -------------------------------------------------------------
-- Utilisateur admin de test
-- Password : Admin1234! (bcrypt 12 rounds)
-- CHANGER en production
-- -------------------------------------------------------------
INSERT INTO users (nom, email, password_hash, role) VALUES
  (
    'Admin',
    'admin@localisation-dab.dz',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewbxPnhNsS.4mxPK',
    'admin'
  )
ON CONFLICT (email) DO NOTHING;

-- Utilisateur standard de test
-- Password : User1234!
INSERT INTO users (nom, email, password_hash, role) VALUES
  (
    'Utilisateur Test',
    'user@localisation-dab.dz',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewbxPnhNsS.4mxPK',
    'user'
  )
ON CONFLICT (email) DO NOTHING;

-- -------------------------------------------------------------
-- DAB de test (Alger centre)
-- -------------------------------------------------------------
INSERT INTO dabs (nom, adresse, latitude, longitude, statut, banque_id) VALUES
  (
    'DAB CPA — Place Audin',
    'Place du 1er Mai, Alger Centre',
    36.7372, 3.0865,
    'actif',
    (SELECT id FROM banques WHERE nom = 'CPA')
  ),
  (
    'DAB BNA — Didouche Mourad',
    'Rue Didouche Mourad, Alger',
    36.7420, 3.0590,
    'actif',
    (SELECT id FROM banques WHERE nom = 'BNA')
  ),
  (
    'DAB BEA — Bab Ezzouar',
    'Avenue de l''Université, Bab Ezzouar',
    36.7195, 3.1834,
    'maintenance',
    (SELECT id FROM banques WHERE nom = 'BEA')
  ),
  (
    'DAB CNEP — Hussein Dey',
    'Rue des Frères Bouadou, Hussein Dey',
    36.7310, 3.1200,
    'hors_service',
    (SELECT id FROM banques WHERE nom = 'CNEP')
  )
ON CONFLICT (osm_id) DO NOTHING;

-- -------------------------------------------------------------
-- Association DAB ↔ Services
-- -------------------------------------------------------------
INSERT INTO dab_services (dab_id, service_id)
SELECT d.id, s.id
FROM dabs d, services s
WHERE d.nom = 'DAB CPA — Place Audin'
  AND s.nom IN ('retrait', 'solde')
ON CONFLICT DO NOTHING;

INSERT INTO dab_services (dab_id, service_id)
SELECT d.id, s.id
FROM dabs d, services s
WHERE d.nom = 'DAB BNA — Didouche Mourad'
  AND s.nom IN ('retrait', 'depot', 'solde', 'pmr')
ON CONFLICT DO NOTHING;
