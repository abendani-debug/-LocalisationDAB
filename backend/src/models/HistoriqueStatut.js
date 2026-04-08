const db = require('../config/db');

const create = (dabId, champ, ancienneValeur, nouvelleValeur, source, userId = null) =>
  db.query(
    `INSERT INTO historique_statuts
       (dab_id, champ, ancienne_valeur, nouvelle_valeur, source, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [dabId, champ, ancienneValeur || null, nouvelleValeur, source, userId]
  );

const findByDabId = (dabId) =>
  db.query(
    `SELECT h.*, u.nom AS user_nom
     FROM historique_statuts h
     LEFT JOIN users u ON u.id = h.user_id
     WHERE h.dab_id = $1
     ORDER BY h.created_at DESC`,
    [dabId]
  );

module.exports = { create, findByDabId };
