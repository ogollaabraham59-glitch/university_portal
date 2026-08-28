const express = require("express");

const router = express.Router();

const {
    saveCourse,
    unsaveCourse,
    getSavedCourses,
    saveUniversity,
    unsaveUniversity,
    getSavedUniversities
} = require("../controllers/savedController");

const {
    auth,
    authorizeRoles
} = require("../midllewear/auth");


// ======================================================
// SAVED COURSES
// ======================================================

// Save course
router.post(
    "/courses/:courseId",
    auth,
    authorizeRoles("student"),
    saveCourse
);


// Unsave course
router.delete(
    "/courses/:courseId",
    auth,
    authorizeRoles("student"),
    unsaveCourse
);


// Get my saved courses
router.get(
    "/courses",
    auth,
    authorizeRoles("student"),
    getSavedCourses
);


// ======================================================
// SAVED UNIVERSITIES
// ======================================================

// Save university
router.post(
    "/universities/:universityId",
    auth,
    authorizeRoles("student"),
    saveUniversity
);


// Unsave university
router.delete(
    "/universities/:universityId",
    auth,
    authorizeRoles("student"),
    unsaveUniversity
);


// Get my saved universities
router.get(
    "/universities",
    auth,
    authorizeRoles("student"),
    getSavedUniversities
);


module.exports = router;