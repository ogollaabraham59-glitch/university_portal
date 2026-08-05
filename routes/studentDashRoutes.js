const express = require("express");
const router = express.Router();

const {
    studentDashboard,
    dashboardStatistics,
    getStudentProfile,
    updateStudentProfile,
    deleteStudentProfile
} = require("../controllers/studentdashController");

const { auth, authorizeRoles } = require("../midllewear/auth");

router.get("/dashboard", auth, authorizeRoles("admin"), studentDashboard);

router.get("/dashboard/statistics", auth, authorizeRoles("admin"), dashboardStatistics);

router.get("/dashboard/profile", auth, authorizeRoles("admin"), getStudentProfile);

router.put("/dashboard/profile", auth, authorizeRoles("admin"), updateStudentProfile);

router.delete("/dashboard/profile", auth, authorizeRoles("admin"), deleteStudentProfile);

module.exports = router;