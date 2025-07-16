var express = require('express');
const { signUp, login, createProj, saveProject, getProjects, getProject, deleteProject, editProject, executeCode } = require('../controllers/userController');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/register", signUp); // Use register endpoint for signUp
router.post("/login", login); 
router.post("/createProj", createProj); 
router.post("/saveProject", saveProject); 
router.post("/getProjects", getProjects); 
router.post("/getProject", getProject); 
router.post("/deleteProject", deleteProject); 
router.post("/editProject", editProject);
router.post("/execute", executeCode); // New endpoint for code execution 

module.exports = router;