const express = require("express");

const router = express.Router();

const {
    addCourseToUniversity,
    getUniversityCourses,
    getCourseUniversities,
    getUniversityCourseById,
    updateUniversityCourse,
    removeCourseFromUniversity,
    updateFees,
    updateIntakes,
    updateApplicationLink,
    updateAvailability
} = require("../controllers/universityCourseController");

const {
    auth,
    authorizeRoles
} = require("../Midllewear/auth");


// ======================================================
// PUBLIC ROUTES
// ======================================================

// Get courses offered by a university
router.get(
    "/university/:universityId",
    getUniversityCourses
);


// Get universities offering a course
router.get(
    "/course/:courseId/universities",
    getCourseUniversities
);


// Get specific university-course
router.get(
    "/:id",
    getUniversityCourseById
);


// ======================================================
// ADMIN ROUTES
// ======================================================

// Add course to university
router.post(
    "/",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    addCourseToUniversity
);


// Update university course
router.put(
    "/:id",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    updateUniversityCourse
);


// Remove course from university
router.delete(
    "/:id",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    removeCourseFromUniversity
);


// Update fees
router.patch(
    "/:id/fees",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    updateFees
);


// Update intakes
router.patch(
    "/:id/intakes",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    updateIntakes
);


// Update application link
router.patch(
    "/:id/application-link",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    updateApplicationLink
);


// Update availability
router.patch(
    "/:id/availability",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    updateAvailability
);


module.exports = router;