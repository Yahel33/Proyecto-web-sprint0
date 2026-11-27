var express = require('express');
var router = express.Router();
const { body } = require('express-validator');
const controller = require('../../controllers/web/auth');

const loginValidators = [
  body('email').trim().isEmail().withMessage((value, { req }) => req.__('auth.validation.emailInvalid')),
  body('password').notEmpty().withMessage((value, { req }) => req.__('auth.validation.passwordRequired'))
];

router.get('/login', controller.showLogin);
router.post('/login', loginValidators, controller.login);
router.post('/logout', controller.logout);

module.exports = router;
