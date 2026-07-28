const express = require('express')
const router = express.Router()
const loginControllers = require('../controllers/loginControllers')

//login routes
router.post('/register', loginControllers.registerAdmin)
router.post('/', loginControllers.logIn)

module.exports = router