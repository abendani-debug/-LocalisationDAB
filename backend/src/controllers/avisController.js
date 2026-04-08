require('express-async-errors');
const Avis = require('../models/Avis');
const DAB = require('../models/DAB');
const { successResponse, errorResponse } = require('../utils/responseUtils');

const getAll = async (req, res) => {
  const { id: dabId } = req.params;
  const [avisResult, statsResult] = await Promise.all([
    Avis.findByDabId(dabId),
    Avis.getStats(dabId),
  ]);
  return successResponse(res, {
    stats: statsResult.rows[0],
    avis: avisResult.rows,
  });
};

const create = async (req, res) => {
  const { id: dabId } = req.params;
  const { note, commentaire } = req.body;

  const dab = await DAB.findById(dabId);
  if (!dab.rows.length) return errorResponse(res, 'DAB introuvable.', 404);

  const existing = await Avis.findByDabAndUser(dabId, req.user.id);
  if (existing.rows.length) {
    return errorResponse(res, 'Vous avez déjà laissé un avis pour ce DAB.', 409);
  }

  const result = await Avis.create(dabId, req.user.id, note, commentaire);
  return successResponse(res, result.rows[0], 201, 'Avis publié.');
};

const remove = async (req, res) => {
  const { avisId } = req.params;
  const avis = await Avis.findById(avisId);

  if (!avis.rows.length) return errorResponse(res, 'Avis introuvable.', 404);

  const isOwner = avis.rows[0].user_id === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return errorResponse(res, 'Accès refusé.', 403);

  await Avis.remove(avisId);
  return successResponse(res, null, 200, 'Avis supprimé.');
};

module.exports = { getAll, create, remove };
