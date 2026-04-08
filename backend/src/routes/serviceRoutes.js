const router = require('express').Router();
const { getAll } = require('../controllers/serviceController');

router.get('/', getAll);

module.exports = router;
