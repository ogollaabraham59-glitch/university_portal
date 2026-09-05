const express = require("express");

const router = express.Router();

const {
    addCourseToUniversity,
    getUniversityCourses,
    getCourseUniversities,
    getUniversityCourseById,
    updateUniversityCourse,
    removeCourseFromUniversity,
    updateAnnualFees,
    updateIntake,
    updateApplicationLink,
    updateAvailability
} = require("../controllers/universityCourseController");

const {
    auth,
    authorizeRoles,

} = require("../midllewear/auth");

const {

    checkUniversityOwnership
} = require("../midllewear/universityOwnership");


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


// Get specific university-course relationship
router.get(
    "/:id",
    getUniversityCourseById
);


// ======================================================
// ADMIN ROUTES
// ======================================================


// ------------------------------------------------------
// Add course to university
// ------------------------------------------------------

router.post(
    "/",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    checkUniversityOwnership,
    addCourseToUniversity
);


// ------------------------------------------------------
// Update university course
// ------------------------------------------------------

router.put(
    "/:id",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    checkUniversityOwnership,
    updateUniversityCourse
);


// ------------------------------------------------------
// Remove course from university
// ------------------------------------------------------

router.delete(
    "/:id",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    checkUniversityOwnership,
    removeCourseFromUniversity
);


// ------------------------------------------------------
// Update annual fees
// ------------------------------------------------------

router.patch(
    "/:id/fees",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    checkUniversityOwnership,
    updateAnnualFees
);


// ------------------------------------------------------
// Update intake
// ------------------------------------------------------

router.patch(
    "/:id/intake",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    checkUniversityOwnership,
    updateIntake
);


// ------------------------------------------------------
// Update application link
// ------------------------------------------------------

router.patch(
    "/:id/application-link",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    checkUniversityOwnership,
    updateApplicationLink
);


// ------------------------------------------------------
// Update availability
// ------------------------------------------------------

router.patch(
    "/:id/availability",
    auth,
    authorizeRoles(
        "super_admin",
        "university_admin"
    ),
    checkUniversityOwnership,
    updateAvailability
);


module.exports = router;