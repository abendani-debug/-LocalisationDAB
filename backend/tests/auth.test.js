jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('node-cron', () => ({ schedule: jest.fn() }));
jest.mock('../src/utils/osmImport', () => ({ syncGooglePlaces: jest.fn() }));
jest.mock('../src/config/socket', () => ({
  initSocket: jest.fn(),
  getIO: jest.fn(() => ({ emit: jest.fn(), to: jest.fn().mockReturnThis() })),
}));
jest.mock('../src/models/User');

const request = require('supertest');
const app     = require('../src/app');
const User    = require('../src/models/User');

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('crée un compte et retourne 201', async () => {
    User.findByEmail.mockResolvedValue({ rows: [] });
    User.create.mockResolvedValue({
      rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user' }],
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Alice', email: 'alice@test.com', password: 'Password1!' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('alice@test.com');
    expect(res.body.data.password_hash).toBeUndefined();
  });

  it('retourne 400 si email déjà utilisé', async () => {
    User.findByEmail.mockResolvedValue({
      rows: [{ id: 1, email: 'alice@test.com' }],
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Alice', email: 'alice@test.com', password: 'Password1!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).not.toMatch(/email/i);
  });

  it('retourne 422 si body incomplet', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@test.com' });

    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  const bcrypt = require('bcryptjs');

  beforeEach(() => jest.clearAllMocks());

  it('retourne un token JWT valide', async () => {
    const hash = await bcrypt.hash('Password1!', 4);
    User.findByEmail.mockResolvedValue({
      rows: [{ id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user', password_hash: hash, is_active: true }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'Password1!' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  it('retourne 401 si mot de passe incorrect', async () => {
    const hash = await bcrypt.hash('AutreMotDePasse!', 4);
    User.findByEmail.mockResolvedValue({
      rows: [{ id: 1, email: 'alice@test.com', password_hash: hash, is_active: true }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'MauvaisPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.data).toBeUndefined();
  });

  it('retourne 401 si utilisateur inconnu', async () => {
    User.findByEmail.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@test.com', password: 'Password1!' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  const jwt     = require('jsonwebtoken');
  const { env } = require('../src/config/env');
  const db      = require('../src/config/db');

  beforeEach(() => jest.clearAllMocks());

  it('retourne le profil si JWT valide', async () => {
    const token = jwt.sign({ userId: 1, role: 'user' }, env.JWT_SECRET, { expiresIn: '1h' });
    const fakeUser = { id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user', is_active: true };
    // authMiddleware appelle db.query directement
    db.query.mockResolvedValue({ rows: [fakeUser] });
    User.findById.mockResolvedValue({ rows: [fakeUser] });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(1);
  });

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/auth/password', () => {
  const jwt     = require('jsonwebtoken');
  const bcrypt  = require('bcryptjs');
  const { env } = require('../src/config/env');
  const db      = require('../src/config/db');

  beforeEach(() => jest.clearAllMocks());

  it('met à jour le mot de passe si currentPassword correct', async () => {
    const hash    = await bcrypt.hash('OldPass1!', 4);
    const token   = jwt.sign({ userId: 1, role: 'user' }, env.JWT_SECRET, { expiresIn: '1h' });
    const fakeUser = { id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user', is_active: true };
    db.query.mockResolvedValue({ rows: [fakeUser] });
    User.findById.mockResolvedValue({ rows: [fakeUser] });
    User.findByEmail.mockResolvedValue({
      rows: [{ id: 1, email: 'alice@test.com', password_hash: hash }],
    });
    User.updatePassword.mockResolvedValue({ rowCount: 1 });

    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'OldPass1!', newPassword: 'NewPass1!' });

    expect(res.status).toBe(200);
  });

  it('retourne 400 si currentPassword incorrect', async () => {
    const hash    = await bcrypt.hash('OldPass1!', 4);
    const token   = jwt.sign({ userId: 1, role: 'user' }, env.JWT_SECRET, { expiresIn: '1h' });
    const fakeUser = { id: 1, nom: 'Alice', email: 'alice@test.com', role: 'user', is_active: true };
    db.query.mockResolvedValue({ rows: [fakeUser] });
    User.findById.mockResolvedValue({ rows: [fakeUser] });
    User.findByEmail.mockResolvedValue({
      rows: [{ id: 1, email: 'alice@test.com', password_hash: hash }],
    });

    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'MauvaisAncien!', newPassword: 'NewPass1!' });

    expect(res.status).toBe(400);
  });
});
