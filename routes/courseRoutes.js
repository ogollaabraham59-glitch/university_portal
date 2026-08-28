const express = require("express");

const router = express.Router();

const {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getCoursesByUniversity,
    searchCourses
} = require("../controllers/courseController");

const {
    auth,
    authorizeRoles
} = require("../midllewear/auth");


// ======================================================
// PUBLIC ROUTES
// ======================================================

// Get all courses
router.get(
    "/",
    getCourses
);


// Search courses
router.get(
    "/search",
    searchCourses
);


// Get courses belonging to a university
router.get(
    "/university/:universityId",
    getCoursesByUniversity
);


// Get one course
router.get(
    "/:id",
    getCourseById
);


// ======================================================
// UNIVERSITY ADMIN / SUPER ADMIN
// ======================================================

// Create course
router.post(
    "/",
    auth,
    authorizeRoles("university_admin", "super_admin"),
    createCourse
);


// Update course
router.put(
    "/:id",
    auth,
    authorizeRoles("university_admin", "super_admin"),
    updateCourse
);


// Delete course
router.delete(
    "/:id",
    auth,
    authorizeRoles("university_admin", "super_admin"),
    deleteCourse
);


module.exports = router;