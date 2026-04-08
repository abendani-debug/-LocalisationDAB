-- =============================================================
-- 003_osm_id_size.sql — Agrandissement colonne osm_id
-- Les place_id Google Places peuvent dépasser 50 caractères
-- =============================================================

ALTER TABLE dabs
  ALTER COLUMN osm_id TYPE VARCHAR(150);
