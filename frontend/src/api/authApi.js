import api from './axiosConfig';

export const register = (data) =>
  api.post('/auth/register', data).then((r) => r.data);

export const login = (data) =>
  api.post('/auth/login', data).then((r) => r.data);

export const getMe = () =>
  api.get('/auth/me').then((r) => r.data);

export const updatePassword = (data) =>
  api.put('/auth/password', data).then((r) => r.data);
