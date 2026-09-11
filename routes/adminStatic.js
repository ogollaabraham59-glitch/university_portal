const express = require("express");

const router = express.Router();

const {
    getAdminStatistics
} = require("../controllers/adminStatsController");

const {
    auth,
    authorizeRoles
} = require("../midllewear/auth");

// ======================================================
// SUPER ADMIN DASHBOARD STATISTICS
// ======================================================

router.get(
    "/",
    auth,
    authorizeRoles("super_admin"),
    getAdminStatistics
);

module.exports = router;