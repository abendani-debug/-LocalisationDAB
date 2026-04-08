import api from './axiosConfig';

export const getAvis = (dabId) =>
  api.get(`/dabs/${dabId}/avis`).then((r) => r.data);

export const createAvis = (dabId, data) =>
  api.post(`/dabs/${dabId}/avis`, data).then((r) => r.data);

export const deleteAvis = (dabId, avisId) =>
  api.delete(`/dabs/${dabId}/avis/${avisId}`).then((r) => r.data);
