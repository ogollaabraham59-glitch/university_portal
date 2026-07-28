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

const { auth } = require("../midllewear/auth");

router.get("/dashboard", auth, superAdminDashboard);

router.get("/users", auth, getAllUsers);

router.get("/universities", auth, getAllUniversities);

router.put("/verify/:id", auth, verifyUniversity);

router.delete("/users/:id", auth, deleteUser);

router.delete("/universities/:id", auth, deleteUniversity);

module.exports = router;