var express = require('express');
var router = express.Router();
const controller = require('../controllers');

router.get('/', controller.home);
router.get('/products', controller.catalog);
router.get('/health', controller.healthCheck);

module.exports = router;
