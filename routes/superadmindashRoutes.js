const express = require("express");
const router = express.Router();

const {
    superAdminDashboard,
    getAllUsers,
    getAllUniversities,
    verifyUniversity,
    deleteUser,
    deleteUniversity
} = require("../controllers/superadmindashController");

const { auth, authorizeRoles } = require("../midllewear/auth");

router.get("/dashboard", auth, authorizeRoles("super_admin"), superAdminDashboard);

router.get("/users", auth, authorizeRoles("super_admin"), getAllUsers);

router.get("/universities", auth, authorizeRoles("super_admin"), getAllUniversities);

router.put("/verify/:id", auth, authorizeRoles("super_admin"), verifyUniversity);

router.delete("/users/:id", auth, authorizeRoles("super_admin"), deleteUser);

router.delete("/universities/:id", auth, authorizeRoles("super_admin"), deleteUniversity);

module.exports = router;