var express = require('express');
var router = express.Router();
const controller = require('../controllers');


router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/health', controller.healthCheck);
module.exports = router;
