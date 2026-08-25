const express = require("express");
const router = express.Router();

const {
    superAdminDashboard,
    getAllUsers,
    createUniversityAdmin,
    deleteUser,

    getAllUniversities,
    createUniversity,
    verifyUniversity,
    deleteUniversity,

    getAllCourses,
    createCourse,
    deleteCourse
} = require("../controllers/superadmindashController");


const { auth, authorizeRoles } = require("../midllewear/auth");



// ======================================
// Dashboard
// ======================================

router.get(
    "/dashboard", auth,
    authorizeRoles("super_admin"), superAdminDashboard

);


// ======================================
// USERS
// ======================================

router.get(
    "/users", auth,
    authorizeRoles("super_admin"),
    getAllUsers
);

router.post(
    "/users/university_admin",
    auth,
    authorizeRoles("super_admin"),
    createUniversityAdmin
);

router.delete(
    "/users/:id",
    auth,
    authorizeRoles("super_admin"),
    deleteUser
);


// ======================================
// UNIVERSITIES
// ======================================

router.get(
    "/university",
    auth,
    authorizeRoles("super_admin"),
    getAllUniversities
);

router.post(
    "/university",
    auth,
    authorizeRoles("super_admin"),
    createUniversity
);

router.put(
    "/university/:id/verify",
    auth,
    authorizeRoles("super_admin"),
    verifyUniversity
);

router.delete(
    "/university/:id",
    auth,
    authorizeRoles("super_admin"),
    deleteUniversity
);


// ======================================
// COURSES
// ======================================

router.get(
    "/courses",
    auth,
    authorizeRoles("super_admin", "university_admin"),
    getAllCourses
);

router.post(
    "/courses",
    auth,
    authorizeRoles("super_admin", "university_admin"),
    createCourse
);

router.delete(
    "/courses/:id",
    auth,
    authorizeRoles("super_admin"),
    deleteCourse
);


module.exports = router;