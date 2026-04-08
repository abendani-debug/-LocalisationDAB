require('express-async-errors');
const Banque = require('../models/Banque');
const { successResponse } = require('../utils/responseUtils');

const getAll = async (req, res) => {
  const result = await Banque.findAll();
  return successResponse(res, result.rows);
};

module.exports = { getAll };
