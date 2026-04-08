const db = require('../config/db');

const findByEmail = (email) =>
  db.query('SELECT * FROM users WHERE email = $1', [email]);

const findById = (id) =>
  db.query(
    'SELECT id, nom, email, role, is_active, created_at FROM users WHERE id = $1',
    [id]
  );

const create = (nom, email, passwordHash) =>
  db.query(
    `INSERT INTO users (nom, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, nom, email, role, created_at`,
    [nom, email, passwordHash]
  );

const updatePassword = (id, passwordHash) =>
  db.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [passwordHash, id]
  );

module.exports = { findByEmail, findById, create, updatePassword };
