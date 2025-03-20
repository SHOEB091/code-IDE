var express = require('express');
var router = express.Router();
var { signUp } = require('../controllers/userController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/signUp', signUp);

module.exports = router;