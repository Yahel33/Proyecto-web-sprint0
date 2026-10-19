var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth');
const authenticate = require('../middlewares/authenticate');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;