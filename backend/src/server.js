require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const http = require('http');
const cron = require('node-cron');
const app = require('./app');
const { initSocket, getIO } = require('./config/socket');
const { env } = require('./config/env');
const Signalement = require('./models/Signalement');
const DAB = require('./models/DAB');

const server = http.createServer(app);
initSocket(server);

/* ── Cron : nettoyage des votes expirés toutes les 30 minutes ─── */
cron.schedule('*/30 * * * *', async () => {
  try {
    await Signalement.deleteExpired();
    const result = await DAB.resetExpiredEtats();
    if (result.rows.length > 0) {
      const io = getIO();
      result.rows.forEach(({ id }) => {
        io.emit('dab_update', {
          dabId: id,
          etatCommunautaire: null,
          vote_dominant: null,
          votes: { disponible: 0, vide: 0, en_panne: 0 },
          totalVotes: 0,
          timestamp: new Date().toISOString(),
        });
      });
      console.log(`[cron] ${result.rows.length} DAB(s) remis à null après expiration des votes.`);
    }
  } catch (err) {
    console.error('[cron] Erreur nettoyage signalements :', err.message);
  }
});

server.listen(env.PORT, () => {
  console.log(`[LocalisationDAB] Serveur démarré sur le port ${env.PORT} (${env.NODE_ENV})`);
});

process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection :', reason);
  server.close(() => process.exit(1));
});
