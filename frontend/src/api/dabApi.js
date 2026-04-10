import api from './axiosConfig';

export const getDABs = (params) =>
  api.get('/dabs', { params }).then((r) => r.data);

export const getNearbyDABs = (lat, lng, radius = 2, extra = {}) =>
  api.get('/dabs/nearby', { params: { lat, lng, radius, ...extra } }).then((r) => r.data);

export const getDAB = (id) =>
  api.get(`/dabs/${id}`).then((r) => r.data);

export const createDAB = (data) =>
  api.post('/dabs', data).then((r) => r.data);

export const updateDAB = (id, data) =>
  api.put(`/dabs/${id}`, data).then((r) => r.data);

export const deleteDAB = (id) =>
  api.delete(`/dabs/${id}`).then((r) => r.data);

// ── Propositions communautaires ──────────────────────────────

export const proposerDAB = (data) =>
  api.post('/dabs/proposer', data).then((r) => r.data);

export const getPropositions = () =>
  api.get('/dabs/propositions').then((r) => r.data);

export const approuverProposition = (id) =>
  api.post(`/dabs/propositions/${id}/approuver`).then((r) => r.data);

export const rejeterProposition = (id) =>
  api.delete(`/dabs/propositions/${id}/rejeter`).then((r) => r.data);
