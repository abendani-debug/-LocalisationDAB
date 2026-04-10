jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('node-cron', () => ({ schedule: jest.fn() }));
jest.mock('../src/utils/osmImport', () => ({ syncGooglePlaces: jest.fn() }));
jest.mock('../src/config/socket', () => ({
  initSocket: jest.fn(),
  getIO: jest.fn(() => ({ emit: jest.fn(), to: jest.fn().mockReturnThis() })),
}));
jest.mock('../src/models/Avis');
jest.mock('../src/models/DAB');

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const app     = require('../src/app');
const Avis    = require('../src/models/Avis');
const DAB     = require('../src/models/DAB');
const db      = require('../src/config/db');
const { env } = require('../src/config/env');

const makeToken = (id = 1, role = 'user') =>
  jwt.sign({ userId: id, role }, env.JWT_SECRET, { expiresIn: '1h' });

const fakeDAB  = { id: 1, nom: 'DAB Test', statut: 'actif', is_verified: true };
const fakeAvis = { id: 10, dab_id: 1, user_id: 1, note: 4, commentaire: 'Bien', created_at: new Date().toISOString() };

beforeEach(() => jest.clearAllMocks());

describe('GET /api/dabs/:id/avis', () => {
  it('retourne les avis et les stats du DAB', async () => {
    Avis.findByDabId.mockResolvedValue({ rows: [fakeAvis] });
    Avis.getStats.mockResolvedValue({ rows: [{ avg_note: '4.00', total: 1 }] });

    const res = await request(app).get('/api/dabs/1/avis');

    expect(res.status).toBe(200);
    expect(res.body.data.avis).toHaveLength(1);
    expect(res.body.data.stats.total).toBe(1);
  });

  it('retourne une liste vide si aucun avis', async () => {
    Avis.findByDabId.mockResolvedValue({ rows: [] });
    Avis.getStats.mockResolvedValue({ rows: [{ avg_note: null, total: 0 }] });

    const res = await request(app).get('/api/dabs/1/avis');

    expect(res.status).toBe(200);
    expect(res.body.data.avis).toHaveLength(0);
  });
});

describe('POST /api/dabs/:id/avis', () => {
  it('crée un avis pour un utilisateur authentifié', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user', is_active: true }] });
    DAB.findById.mockResolvedValue({ rows: [fakeDAB] });
    Avis.findByDabAndUser.mockResolvedValue({ rows: [] });
    Avis.create.mockResolvedValue({ rows: [fakeAvis] });

    const res = await request(app)
      .post('/api/dabs/1/avis')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ note: 4, commentaire: 'Bien' });

    expect(res.status).toBe(201);
    expect(res.body.data.note).toBe(4);
  });

  it('retourne 409 si avis déjà existant pour ce DAB', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user', is_active: true }] });
    DAB.findById.mockResolvedValue({ rows: [fakeDAB] });
    Avis.findByDabAndUser.mockResolvedValue({ rows: [fakeAvis] });

    const res = await request(app)
      .post('/api/dabs/1/avis')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ note: 3, commentaire: 'Doublon' });

    expect(res.status).toBe(409);
  });

  it('retourne 404 si le DAB n\'existe pas', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user', is_active: true }] });
    DAB.findById.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/dabs/999/avis')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ note: 3, commentaire: 'Test' });

    expect(res.status).toBe(404);
  });

  it('retourne 422 si note invalide', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user', is_active: true }] });

    const res = await request(app)
      .post('/api/dabs/1/avis')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ note: 10, commentaire: 'Note hors limites' }); // note doit être entre 1 et 5

    expect(res.status).toBe(422);
  });

  it('retourne 401 sans authentification', async () => {
    const res = await request(app)
      .post('/api/dabs/1/avis')
      .send({ note: 4, commentaire: 'Test' });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/dabs/:id/avis/:avisId', () => {
  it('permet au propriétaire de supprimer son avis', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user', is_active: true }] });
    Avis.findById.mockResolvedValue({ rows: [fakeAvis] }); // user_id: 1
    Avis.remove.mockResolvedValue({ rowCount: 1 });

    const res = await request(app)
      .delete('/api/dabs/1/avis/10')
      .set('Authorization', `Bearer ${makeToken(1)}`);

    expect(res.status).toBe(200);
  });

  it('permet à un admin de supprimer n\'importe quel avis', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 99, nom: 'Admin', email: 'admin@test.com', role: 'admin', is_active: true }] });
    Avis.findById.mockResolvedValue({ rows: [{ ...fakeAvis, user_id: 1 }] });
    Avis.remove.mockResolvedValue({ rowCount: 1 });

    const adminToken = jwt.sign({ userId: 99, role: 'admin' }, env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .delete('/api/dabs/1/avis/10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('retourne 403 si non propriétaire et non admin', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 2, nom: 'Bob', email: 'bob@test.com', role: 'user', is_active: true }] });
    Avis.findById.mockResolvedValue({ rows: [{ ...fakeAvis, user_id: 1 }] }); // appartient à user 1

    const otherUserToken = jwt.sign({ userId: 2, role: 'user' }, env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .delete('/api/dabs/1/avis/10')
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
  });

  it('retourne 404 si avis inexistant', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user', is_active: true }] });
    Avis.findById.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .delete('/api/dabs/1/avis/999')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
  });
});
