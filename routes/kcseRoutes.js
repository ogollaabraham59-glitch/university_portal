const express = require("express");
const router = express.Router();

const kcseResultController = require("../controllers/kcseController");
const { auth, authorizeRoles } = require("../midllewear/auth");

// Upload KCSE Result
router.post(
    "/",
    auth,
    authorizeRoles("student"),
    kcseResultController.addKcseResult
);

// Get All Results
router.get(
    "/",
    auth,
    authorizeRoles("admin"),
    kcseResultController.getAllKcseResults
);

// Get Result By ID
router.get(
    "/:id",
    auth,
    kcseResultController.getKcseResultById
);

// Update Result
router.put(
    "/:id",
    auth,
    authorizeRoles("admin"),
    kcseResultController.updateKcseResult
);

// Delete Result
router.delete(
    "/:id",
    auth,
    authorizeRoles("admin"),
    kcseResultController.deleteKcseResult
);

module.exports = router;