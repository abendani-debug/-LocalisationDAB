const router = require('express').Router();
const { register, login, me, updatePassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validateMiddleware');
const { registerValidator, loginValidator, passwordValidator } = require('../validators/authValidator');

router.post('/register', registerValidator, validate, register);
router.post('/login',    authLimiter, loginValidator, validate, login);
router.get('/me',        authMiddleware, me);
router.put('/password',  authMiddleware, passwordValidator, validate, updatePassword);

module.exports = router;
