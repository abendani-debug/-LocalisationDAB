jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('node-cron', () => ({ schedule: jest.fn() }));
jest.mock('../src/utils/osmImport', () => ({ syncGooglePlaces: jest.fn() }));
jest.mock('../src/config/socket', () => ({
  initSocket: jest.fn(),
  getIO: jest.fn(() => ({ emit: jest.fn(), to: jest.fn().mockReturnThis() })),
}));
jest.mock('../src/models/DAB');
jest.mock('../src/models/Service');
jest.mock('../src/models/HistoriqueStatut');

const request  = require('supertest');
const jwt      = require('jsonwebtoken');
const app      = require('../src/app');
const DAB      = require('../src/models/DAB');
const Service  = require('../src/models/Service');
const HistoriqueStatut = require('../src/models/HistoriqueStatut');
const db       = require('../src/config/db');
const { env }  = require('../src/config/env');

const adminUser = { id: 99, nom: 'Admin', email: 'admin@test.com', role: 'admin', is_active: true };
const regularUser = { id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user', is_active: true };

const makeAdminToken = () =>
  jwt.sign({ userId: 99, role: 'admin' }, env.JWT_SECRET, { expiresIn: '1h' });

const makeUserToken = () =>
  jwt.sign({ userId: 1, role: 'user' }, env.JWT_SECRET, { expiresIn: '1h' });

const fakeDAB = {
  id: 1, nom: 'DAB Test', adresse: '1 rue Test', latitude: 36.7, longitude: 3.1,
  statut: 'actif', etat_communautaire: null, banque_id: 1, banque_nom: 'CPA',
  is_verified: true, type_lieu: 'atm', source: 'admin',
};

beforeEach(() => {
  jest.clearAllMocks();
  HistoriqueStatut.create.mockResolvedValue({ rows: [] });
});

// Helper pour simuler un admin authentifié via authMiddleware (qui appelle db.query directement)
const mockAdminAuth = () => db.query.mockResolvedValue({ rows: [adminUser] });
const mockUserAuth  = () => db.query.mockResolvedValue({ rows: [regularUser] });

describe('GET /api/dabs', () => {
  it('retourne la liste des DAB vérifiés', async () => {
    DAB.findAll.mockResolvedValue({ rows: [fakeDAB] });

    const res = await request(app).get('/api/dabs');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].nom).toBe('DAB Test');
  });

  it('accepte les filtres lat/lng/radius', async () => {
    DAB.findAll.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .get('/api/dabs')
      .query({ lat: '36.7', lng: '3.1', radius: '5' });

    expect(res.status).toBe(200);
    expect(DAB.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ lat: '36.7', lng: '3.1', radius: '5' })
    );
  });

  it('retourne [] si aucun DAB', async () => {
    DAB.findAll.mockResolvedValue({ rows: [] });

    const res = await request(app).get('/api/dabs');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('GET /api/dabs/nearby', () => {
  it('retourne les DAB proches triés par distance', async () => {
    DAB.findNearby.mockResolvedValue({ rows: [{ ...fakeDAB, distance_km: 0.5 }] });

    const res = await request(app)
      .get('/api/dabs/nearby')
      .query({ lat: '36.7', lng: '3.1' });

    expect(res.status).toBe(200);
    expect(res.body.data[0].distance_km).toBe(0.5);
  });

  it('retourne [] si aucun DAB proche', async () => {
    DAB.findNearby.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .get('/api/dabs/nearby')
      .query({ lat: '36.7', lng: '3.1' });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('retourne 422 si lat manquant', async () => {
    const res = await request(app)
      .get('/api/dabs/nearby')
      .query({ lng: '3.1' });

    expect(res.status).toBe(422);
  });
});

describe('GET /api/dabs/:id', () => {
  it('retourne le DAB avec ses services', async () => {
    DAB.findById.mockResolvedValue({ rows: [fakeDAB] });
    Service.findByDabId.mockResolvedValue({ rows: [{ id: 1, nom: 'Retrait' }] });

    const res = await request(app).get('/api/dabs/1');

    expect(res.status).toBe(200);
    expect(res.body.data.services).toHaveLength(1);
  });

  it('retourne 404 si DAB inexistant', async () => {
    DAB.findById.mockResolvedValue({ rows: [] });

    const res = await request(app).get('/api/dabs/999');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/dabs (admin)', () => {
  it('crée un DAB et retourne 201', async () => {
    mockAdminAuth();
    DAB.create.mockResolvedValue({ rows: [{ ...fakeDAB, id: 2 }] });

    const res = await request(app)
      .post('/api/dabs')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ nom: 'Nouveau DAB', latitude: 36.75, longitude: 3.05, banque_id: 1 });

    expect(res.status).toBe(201);
    expect(HistoriqueStatut.create).toHaveBeenCalledTimes(1);
  });

  it('retourne 422 si champs requis manquants', async () => {
    mockAdminAuth();

    const res = await request(app)
      .post('/api/dabs')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ nom: 'Manque lat/lng' });

    expect(res.status).toBe(422);
  });

  it('retourne 403 pour un utilisateur non-admin', async () => {
    mockUserAuth();

    const res = await request(app)
      .post('/api/dabs')
      .set('Authorization', `Bearer ${makeUserToken()}`)
      .send({ nom: 'Nouveau DAB', latitude: 36.75, longitude: 3.05 });

    expect(res.status).toBe(403);
  });

  it('retourne 401 sans token', async () => {
    const res = await request(app)
      .post('/api/dabs')
      .send({ nom: 'Nouveau DAB', latitude: 36.75, longitude: 3.05 });

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/dabs/:id (admin)', () => {
  it('met à jour un DAB existant', async () => {
    mockAdminAuth();
    DAB.findById.mockResolvedValue({ rows: [fakeDAB] });
    DAB.update.mockResolvedValue({ rows: [{ ...fakeDAB, nom: 'DAB Modifié' }] });

    const res = await request(app)
      .put('/api/dabs/1')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ nom: 'DAB Modifié' });

    expect(res.status).toBe(200);
    expect(res.body.data.nom).toBe('DAB Modifié');
  });

  it('retourne 404 si DAB inexistant', async () => {
    mockAdminAuth();
    DAB.findById.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .put('/api/dabs/999')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ nom: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/dabs/:id (admin)', () => {
  it('supprime un DAB existant', async () => {
    mockAdminAuth();
    DAB.findById.mockResolvedValue({ rows: [fakeDAB] });
    DAB.remove.mockResolvedValue({ rows: [{ id: 1 }] });

    const res = await request(app)
      .delete('/api/dabs/1')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(200);
  });

  it('retourne 404 si DAB inexistant', async () => {
    mockAdminAuth();
    DAB.findById.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .delete('/api/dabs/999')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/dabs/proposer (anonyme)', () => {
  it('soumet une proposition et retourne 201', async () => {
    DAB.propose.mockResolvedValue({ rows: [{ ...fakeDAB, is_verified: false, source: 'communaute' }] });

    const res = await request(app)
      .post('/api/dabs/proposer')
      .send({ nom: 'DAB Proposé', latitude: 36.7, longitude: 3.1, type_lieu: 'atm' });

    expect(res.status).toBe(201);
    expect(res.body.data.is_verified).toBe(false);
  });

  it('retourne 422 si type_lieu manquant', async () => {
    const res = await request(app)
      .post('/api/dabs/proposer')
      .send({ nom: 'DAB Proposé', latitude: 36.7, longitude: 3.1 });

    expect(res.status).toBe(422);
  });
});

describe('GET /api/dabs/propositions (admin)', () => {
  it('retourne la liste des propositions non vérifiées', async () => {
    mockAdminAuth();
    DAB.findPropositions.mockResolvedValue({ rows: [{ ...fakeDAB, is_verified: false }] });

    const res = await request(app)
      .get('/api/dabs/propositions')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/dabs/propositions');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/dabs/propositions/:id/approuver (admin)', () => {
  it('approuve une proposition', async () => {
    mockAdminAuth();
    DAB.approuverProposition.mockResolvedValue({ rows: [{ ...fakeDAB, is_verified: true }] });

    const res = await request(app)
      .post('/api/dabs/propositions/1/approuver')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(200);
    expect(HistoriqueStatut.create).toHaveBeenCalledTimes(1);
  });

  it('retourne 404 si proposition inexistante', async () => {
    mockAdminAuth();
    DAB.approuverProposition.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/dabs/propositions/999/approuver')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/dabs/propositions/:id/rejeter (admin)', () => {
  it('rejette et supprime une proposition', async () => {
    mockAdminAuth();
    DAB.rejeterProposition.mockResolvedValue({ rows: [{ id: 1 }] });

    const res = await request(app)
      .delete('/api/dabs/propositions/1/rejeter')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(200);
  });

  it('retourne 404 si proposition inexistante', async () => {
    mockAdminAuth();
    DAB.rejeterProposition.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .delete('/api/dabs/propositions/999/rejeter')
      .set('Authorization', `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(404);
  });
});
