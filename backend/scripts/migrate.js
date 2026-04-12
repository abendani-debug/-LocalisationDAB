const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const files = [
    '../migrations/001_init.sql',
    '../migrations/002_add_community_dab.sql',
    '../seeds/seed.sql',
  ];

  for (const file of files) {
    const filePath = path.resolve(__dirname, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`[migrate] Exécution de ${path.basename(filePath)}...`);
    try {
      await pool.query(sql);
      console.log(`[migrate] ✓ ${path.basename(filePath)}`);
    } catch (err) {
      // Ignore les erreurs "already exists" (idempotent)
      if (err.message.includes('already exists') || err.code === '42P07' || err.code === '42710') {
        console.log(`[migrate] ⚠ ${path.basename(filePath)} — déjà appliqué, ignoré.`);
      } else {
        console.error(`[migrate] ✗ ${path.basename(filePath)} :`, err.message);
        process.exit(1);
      }
    }
  }

  await pool.end();
  console.log('[migrate] Migrations terminées.');
}

migrate();
