const {
    User,
    UniversityCourse
} = require("../models/universityModel");


// ======================================================
// CHECK UNIVERSITY OWNERSHIP
// Used for /api/universities/:id
// ======================================================

const checkUniversityOwnership = async (req, res, next) => {
    try {

        // Super Admin can access everything
        if (req.user.role === "super_admin") {
            return next();
        }

        // Only University Admin continues
        if (req.user.role !== "university_admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const admin = await User.findById(req.user.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "University admin not found"
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: "University admin account is inactive"
            });
        }

        if (!admin.university) {
            return res.status(403).json({
                success: false,
                message: "No university has been assigned to this admin"
            });
        }

        const universityId = req.params.id;

        if (
            admin.university.toString() !==
            universityId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only manage your assigned university"
            });
        }

        next();

    } catch (error) {

        console.error(
            "University ownership error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while checking university ownership"
        });
    }
};


// ======================================================
// CHECK UNIVERSITY COURSE OWNERSHIP
// Used for /api/university-course/:id
// ======================================================

const checkUniversityCourseOwnership = async (
    req,
    res,
    next
) => {
    try {

        // Super Admin can access everything
        if (req.user.role === "super_admin") {
            return next();
        }

        // Only University Admin continues
        if (req.user.role !== "university_admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Find logged-in admin
        const admin = await User.findById(req.user.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "University admin not found"
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: "University admin account is inactive"
            });
        }

        if (!admin.university) {
            return res.status(403).json({
                success: false,
                message:
                    "No university has been assigned to this admin"
            });
        }

        // Get UniversityCourse ID
        const universityCourseId = req.params.id;

        // Find the relationship
        const universityCourse =
            await UniversityCourse.findById(
                universityCourseId
            );

        if (!universityCourse) {
            return res.status(404).json({
                success: false,
                message: "University course not found"
            });
        }

        // Compare university ownership
        if (
            admin.university.toString() !==
            universityCourse.university.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only manage courses belonging to your assigned university"
            });
        }

        // Store relationship for controller if needed
        req.universityCourse = universityCourse;

        next();

    } catch (error) {

        console.error(
            "University course ownership error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while checking university course ownership"
        });
    }
};


module.exports = {
    checkUniversityOwnership,
    checkUniversityCourseOwnership
};