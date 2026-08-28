
const express = require("express");

const router = express.Router();

const {
    checkCourseEligibility,
    getMyEligibleCourses,
    getEligibleCoursesByUniversity
} = require("../controllers/eligibilityController");

const {
    auth,
    authorizeRoles
} = require("../midllewear/auth");


// ======================================================
// CHECK ONE COURSE
// ======================================================

router.get(
    "/course/:courseId",
    auth,
    authorizeRoles("student"),
    checkCourseEligibility
);


// ======================================================
// GET ALL MY ELIGIBLE COURSES
// ======================================================

router.get(
    "/my-courses",
    auth,
    authorizeRoles("student"),
    getMyEligibleCourses
);


// ======================================================
// GET ELIGIBLE COURSES IN A UNIVERSITY
// ======================================================

router.get(
    "/university/:universityId",
    auth,
    authorizeRoles("student"),
    getEligibleCoursesByUniversity
);


module.exports = router;

