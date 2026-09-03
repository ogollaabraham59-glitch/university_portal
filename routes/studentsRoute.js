const express = require("express");

const router = express.Router();

const {
    getStudentProfile,
    updateStudentProfile,
    updateStudentPicture,
    getStudentById,
    verifyStudent,
    activateStudent,
    deactivateStudent,
    registerStudent
} = require("../controllers/StudentsController");

const {
    auth,
    authorizeRoles,
    loginStudent
} = require("../midllewear/auth");

const upload = require("../midllewear/uploadPicture");


// ======================================================
// STUDENT REGISTRATION
// ======================================================

// Register student
// Accepts profile picture through FormData
router.post(
    "/",
    upload.single("profilePicture"),
    registerStudent
);


//studentlogin
router.post(
    "/login", loginStudent
);

// ======================================================
// STUDENT PROFILE
// ======================================================

// Get logged-in student's profile
router.get(
    "/profile",
    auth,
    authorizeRoles("student"),
    getStudentProfile
);


// Update logged-in student's profile
router.put(
    "/profile",
    auth,
    authorizeRoles("student"),
    updateStudentProfile
);


// ======================================================
// STUDENT PROFILE PICTURE
// ======================================================

// Update logged-in student's profile picture
router.put(
    "/profile/picture",
    auth,
    authorizeRoles("student"),
    upload.single("profilePicture"),
    updateStudentPicture
);


// ======================================================
// STUDENT MANAGEMENT
// ======================================================

// Get student by ID
router.get(
    "/:id",
    auth,
    authorizeRoles("super_admin", "university_admin"),
    getStudentById
);


// Verify student
router.put(
    "/:id/verify",
    auth,
    authorizeRoles("super_admin"),
    verifyStudent
);


// Activate student
router.put(
    "/:id/activate",
    auth,
    authorizeRoles("super_admin", "university_admin"),
    activateStudent
);


// Deactivate student
router.put(
    "/:id/deactivate",
    auth,
    authorizeRoles("super_admin"),
    deactivateStudent
);


module.exports = router;