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

router.get("/dashboard", auth, authorizeRoles("university_admin", "super_admin"), studentDashboard);

router.get("/dashboard/statistics", auth, authorizeRoles("university_admin", "super_admin"), dashboardStatistics);

router.get("/dashboard/profile", auth, authorizeRoles("university_admin"), getStudentProfile);

router.put("/dashboard/profile", auth, authorizeRoles("university_admin"), updateStudentProfile);

router.delete("/dashboard/profile", auth, authorizeRoles("university_admin", "super_admin"), deleteStudentProfile);

module.exports = router;