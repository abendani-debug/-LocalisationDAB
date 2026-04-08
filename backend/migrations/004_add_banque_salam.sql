-- =============================================================
-- 004_add_banque_salam.sql — Ajout de Banque Salam
-- =============================================================

INSERT INTO banques (nom)
VALUES ('Banque Salam')
ON CONFLICT (nom) DO NOTHING;
