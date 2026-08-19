const express = require('express')
const router = express.Router()
const loginControllers = require('../controllers/loginControllers')

//login routes
router.post('/register', loginControllers.registerUser);
router.post('/login', loginControllers.logIn);
module.exports = router