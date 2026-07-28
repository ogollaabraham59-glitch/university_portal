const express = require("express");
const router = express.Router();

const {
    studentDashboard,
    dashboardStatistics,
    getStudentProfile,
    updateStudentProfile,
    deleteStudentProfile
} = require("../controllers/studentdashController");

const { auth } = require("../midllewear/auth");

router.get("/dashboard", auth, studentDashboard);

router.get("/dashboard/statistics", auth, dashboardStatistics);

router.get("/dashboard/profile", auth, getStudentProfile);

router.put("/dashboard/profile", auth, updateStudentProfile);

router.delete("/dashboard/profile", auth, deleteStudentProfile);

module.exports = router;