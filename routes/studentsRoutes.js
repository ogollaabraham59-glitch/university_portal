const express = require('express');
const router = express.Router();

const studentprofileController = require('../controllers/studentprofileController');
const { auth, authorizeRoles } = require('../midllewear/auth');

// Create student profile
router.post(
    '/',
    auth,
    authorizeRoles('student'), studentprofileController.addStudentProfile
);

// Get all student profiles
router.get(
    '/',
    auth, studentprofileController.getAllStudentProfiles
);

// Get student profile by ID
router.get(
    '/:id',
    auth, studentprofileController.getStudentProfileById
);

// Update student profile
router.put(
    '/:id',
    auth,
    authorizeRoles('student'), studentprofileController.updateStudentProfile
);

// Delete student profile
router.delete(
    '/:id',
    auth,
    authorizeRoles('admin'), studentprofileController.deleteStudentProfile
);

module.exports = router;