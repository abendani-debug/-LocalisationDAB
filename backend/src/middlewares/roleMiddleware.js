const { errorResponse } = require('../utils/responseUtils');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return errorResponse(res, 'Accès refusé : droits insuffisants.', 403);
  }
  next();
};

const requireAdmin = requireRole('admin');

module.exports = { requireRole, requireAdmin };
