const express = require("express");
const router = express.Router();

const {
    universityDashboard,
    updateUniversity,
    deleteUniversity
} = require("../controllers/universitydashController");

const { auth, authorizeRoles } = require("../midllewear/auth");

router.get("/dashboard", auth, authorizeRoles('university_admin'), universityDashboard);
router.put("/update", auth, authorizeRoles('university_admin'), updateUniversity);
router.delete("/delete", auth, authorizeRoles('super_admin'), deleteUniversity);

module.exports = router;