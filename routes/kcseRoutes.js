const express = require("express");

const router = express.Router();

const {
    uploadResultSlip,
    getMyResult,
    getResultById,
    processResult,
    updateResult,
    deleteResult,
    retryProcessing
} = require("../controllers/kcseController");

const {
    auth,
    authorizeRoles
} = require("../midllewear/auth");


// ======================================================
// STUDENT ROUTES
// ======================================================

// Upload my KCSE result
router.post(
    "/upload",
    auth,
    authorizeRoles("student"),
    uploadResultSlip
);


// Get my KCSE result
router.get(
    "/my-result",
    auth,
    authorizeRoles("student"),
    getMyResult
);


// Delete my KCSE result
router.delete(
    "/:id",
    auth,
    authorizeRoles("student"),
    deleteResult
);


// ======================================================
// ADMIN ROUTES
// ======================================================

// Get result by ID
router.get(
    "/:id",
    auth,
    authorizeRoles("super_admin", "university_admin"),
    getResultById
);


// Process result
router.put(
    "/:id/process",
    auth,
    authorizeRoles("super_admin"),
    processResult
);


// Update result
router.put(
    "/:id",
    auth,
    authorizeRoles("super_admin"),
    updateResult
);


// Retry processing
router.put(
    "/:id/retry",
    auth,
    authorizeRoles("super_admin"),
    retryProcessing
);


module.exports = router;