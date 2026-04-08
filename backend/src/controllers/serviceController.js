require('express-async-errors');
const Service = require('../models/Service');
const { successResponse } = require('../utils/responseUtils');

const getAll = async (req, res) => {
  const result = await Service.findAll();
  return successResponse(res, result.rows);
};

module.exports = { getAll };
