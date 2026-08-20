const express = require("express");
const router = express.Router();

const kcseResultController = require("../controllers/kcseController");
const { auth, authorizeRoles } = require("../midllewear/auth");

// Upload KCSE Result
router.post(
    "/",
    auth,
    authorizeRoles("student", "university_admin", "super_admin"),
    kcseResultController.addKcseResult
);

// Get All Results
router.get(
    "/",
    auth,
    kcseResultController.getAllKcseResults
);

// Get Result By ID
router.get(
    "/:id",
    auth, authorizeRoles("university_admin", "super-admin"),
    kcseResultController.getKcseResultById
);

// Update Result
router.put(
    "/:id",
    auth,
    authorizeRoles("university_admin", "super_admin"),
    kcseResultController.updateKcseResult
);

// Delete Result
router.delete(
    "/:id",
    auth,
    authorizeRoles("university_admin", "super_admin"),
    kcseResultController.deleteKcseResult
);

module.exports = router;