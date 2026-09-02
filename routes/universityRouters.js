const express = require("express");

const router = express.Router();

const {
    createUniversity,
    getUniversities,
    getUniversityById,
    updateUniversity,
    deleteUniversity,
    verifyUniversity,
    activateUniversity,
    deactivateUniversity,
    searchUniversities
} = require("../controllers/universityControllers");

const { auth, authorizeRoles } = require('../midllewear/auth')
const {
    checkUniversityOwnership
} = require("../midllewear/universityOwnership");


// ======================================================
// PUBLIC
// ======================================================

// Get all active universities
router.get(
    "/",
    getUniversities
);


// Search universities
router.get(
    "/search",
    searchUniversities
);


// Get university details
router.get(
    "/:id",
    getUniversityById
);


// ======================================================
// SUPER ADMIN
// ======================================================

// Create university
router.post('/', auth, authorizeRoles('super_admin'), createUniversity
);


// Update university
router.put(
    "/:id",
    auth,
    authorizeRoles("super_admin", "university_admin"), checkUniversityOwnership, updateUniversity
);


// Delete university
router.delete(
    "/:id",
    auth,
    authorizeRoles("super_admin"),
    deleteUniversity
);


// Verify university
router.put(
    "/:id/verify",
    auth,
    authorizeRoles("super_admin"),
    verifyUniversity
);


// Activate university
router.put(
    "/:id/activate",
    auth,
    authorizeRoles("super_admin"),
    activateUniversity
);


// Deactivate university
router.put(
    "/:id/deactivate",
    auth,
    authorizeRoles("super_admin"),
    deactivateUniversity
);


module.exports = router;