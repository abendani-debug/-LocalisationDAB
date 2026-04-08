/**
 * Script d'import manuel Google Places
 * Usage : node scripts/import-google.js  (depuis le dossier backend/)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { syncGooglePlaces } = require('../src/utils/osmImport');

console.log('[Import] Démarrage de la synchronisation Google Places...');

syncGooglePlaces()
  .then((result) => {
    console.log('[Import] Terminé :', result);
    console.log(`  ✅ Total traités : ${result.total}`);
    console.log(`  ➕ Insérés      : ${result.inserted}`);
    console.log(`  🔄 Mis à jour   : ${result.updated}`);
    console.log(`  ❌ Erreurs      : ${result.errors}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Import] Erreur fatale :', err.message);
    process.exit(1);
  });
