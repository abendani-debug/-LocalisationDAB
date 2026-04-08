const db = require('../config/db');

const findByDabId = (dabId) =>
  db.query(
    `SELECT a.id, a.note, a.commentaire, a.created_at,
            u.id AS user_id, u.nom AS user_nom
     FROM avis a
     JOIN users u ON u.id = a.user_id
     WHERE a.dab_id = $1
     ORDER BY a.created_at DESC`,
    [dabId]
  );

const findByDabAndUser = (dabId, userId) =>
  db.query(
    'SELECT * FROM avis WHERE dab_id = $1 AND user_id = $2',
    [dabId, userId]
  );

const findById = (id) =>
  db.query('SELECT * FROM avis WHERE id = $1', [id]);

const create = (dabId, userId, note, commentaire) =>
  db.query(
    `INSERT INTO avis (dab_id, user_id, note, commentaire)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [dabId, userId, note, commentaire || null]
  );

const remove = (id) =>
  db.query('DELETE FROM avis WHERE id = $1 RETURNING id', [id]);

const getStats = (dabId) =>
  db.query(
    `SELECT COUNT(*)::int AS total, ROUND(AVG(note), 1) AS moyenne
     FROM avis WHERE dab_id = $1`,
    [dabId]
  );

module.exports = { findByDabId, findByDabAndUser, findById, create, remove, getStats };
