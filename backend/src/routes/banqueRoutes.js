const router = require('express').Router();
const { getAll } = require('../controllers/banqueController');

router.get('/', getAll);

module.exports = router;
