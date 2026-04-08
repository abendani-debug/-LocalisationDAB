const db = require('../config/db');
const { env } = require('../config/env');

const getActiveVotes = (dabId) =>
  db.query(
    `SELECT etat, COUNT(*)::int AS count
     FROM signalements
     WHERE dab_id = $1 AND expires_at > NOW()
     GROUP BY etat`,
    [dabId]
  );

const findExisting = (dabId, ipHash, cookieId) =>
  db.query(
    `SELECT id FROM signalements
     WHERE dab_id = $1
       AND expires_at > NOW()
       AND (ip_hash = $2 OR cookie_id = $3)`,
    [dabId, ipHash, cookieId]
  );

const create = (dabId, etat, ipHash, cookieId) => {
  const expiresAt = new Date(
    Date.now() + env.SIGNALEMENT_DUREE_HEURES * 60 * 60 * 1000
  ).toISOString();
  return db.query(
    `INSERT INTO signalements (dab_id, etat, ip_hash, cookie_id, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (dab_id, ip_hash) DO UPDATE SET
       etat = EXCLUDED.etat,
       cookie_id = EXCLUDED.cookie_id,
       created_at = NOW(),
       expires_at = EXCLUDED.expires_at
     RETURNING *`,
    [dabId, etat, ipHash, cookieId, expiresAt]
  );
};

const deleteExpired = () =>
  db.query('DELETE FROM signalements WHERE expires_at <= NOW()');

const countByDab = (dabId) =>
  db.query(
    `SELECT COUNT(*)::int AS total
     FROM signalements WHERE dab_id = $1 AND expires_at > NOW()`,
    [dabId]
  );

module.exports = { getActiveVotes, findExisting, create, deleteExpired, countByDab };
