const express = require('express')
const router = express.Router()
const UniversityAdminController = require('../controllers/universityAdminController')

const {
    auth,
    authorizeRoles
} = require("../midllewear/auth");



//login routes
router.post('/', auth, UniversityAdminController.registerUniversityAdmin);


module.exports = router