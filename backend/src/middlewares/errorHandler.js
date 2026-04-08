const { errorResponse } = require('../utils/responseUtils');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  if (err.code === '23505') {
    return errorResponse(res, 'Cette ressource existe déjà.', 409);
  }
  if (err.code === '23503') {
    return errorResponse(res, 'Référence introuvable.', 404);
  }

  return errorResponse(
    res,
    err.message || 'Erreur interne du serveur.',
    err.status || 500
  );
};

module.exports = errorHandler;
