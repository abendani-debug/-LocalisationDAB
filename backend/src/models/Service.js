const db = require('../config/db');

const findAll = () =>
  db.query('SELECT * FROM services ORDER BY nom ASC');

const findByDabId = (dabId) =>
  db.query(
    `SELECT s.*
     FROM services s
     JOIN dab_services ds ON ds.service_id = s.id
     WHERE ds.dab_id = $1`,
    [dabId]
  );

module.exports = { findAll, findByDabId };
