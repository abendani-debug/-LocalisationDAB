const db = require('../config/db');

const findAll = () =>
  db.query('SELECT * FROM banques ORDER BY nom ASC');

const findById = (id) =>
  db.query('SELECT * FROM banques WHERE id = $1', [id]);

module.exports = { findAll, findById };
