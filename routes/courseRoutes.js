const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const { auth, authorizeRoles } = require("../midllewear/auth");

// Create Course
router.post(
    "/",
    auth,
    authorizeRoles("admin"),
    courseController.addCourse
);

// Get All Courses
router.get(
    "/",
    auth,
    courseController.getAllCourses
);

// Get Course By Id
router.get(
    "/:id",
    auth,
    courseController.getCourseById
);

// Update Course
router.put(
    "/:id",
    auth,
    authorizeRoles("admin"),
    courseController.updateCourse
);

// Delete Course
router.delete(
    "/:id",
    auth,
    authorizeRoles("admin"),
    courseController.deleteCourse
);

module.exports = router;