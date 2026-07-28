const express = require('express')
const router = express.Router()
const universityControllers = require('../controllers/universityControllers')
const { auth, authorizeRoles } = require('../midllewear/auth')

//add classroom


router.post('/', auth, authorizeRoles("university_admin"), universityControllers.newuniversity)
router.get('/', auth, authorizeRoles("university_admin"), universityControllers.getAlluniversity)
router.get('/:id', auth, authorizeRoles("super_admin"), universityControllers.getAlluniversityById)
router.put('/:id', auth, authorizeRoles("university_admin"), universityControllers.updateuniversity)
router.delete('/:id', auth, authorizeRoles("super_admin"), universityControllers.deletuniversity)
//

module.exports = router