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

const {
    auth,
    authorizeRoles
} = require("../midllewear/auth");

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
router.post(
    "/",
    auth,
    authorizeRoles("super_admin"),
    createUniversity
);

// Delete/deactivate university
router.delete(
    "/:id",
    auth,
    authorizeRoles("super_admin"),
    deleteUniversity
);

// Verify university
router.patch(
    "/:id/verify",
    auth,
    authorizeRoles("super_admin"),
    verifyUniversity
);

// Activate university
router.patch(
    "/:id/activate",
    auth,
    authorizeRoles("super_admin"),
    activateUniversity
);

// Deactivate university
router.patch(
    "/:id/deactivate",
    auth,
    authorizeRoles("super_admin"),
    deactivateUniversity
);


// ======================================================
// UPDATE UNIVERSITY
// ======================================================

// Super admin can update any university.
// University admin can update ONLY their own university.
router.put(
    "/:id",
    auth,
    authorizeRoles("super_admin", "university_admin"),
    checkUniversityOwnership,
    updateUniversity
);


module.exports = router;