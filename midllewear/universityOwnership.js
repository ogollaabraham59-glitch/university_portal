const {
    User,
    UniversityCourse
} = require("../models/universityModel");


// ======================================================
// CHECK UNIVERSITY OWNERSHIP
// ======================================================

const checkUniversityOwnership = async (
    req,
    res,
    next
) => {
    try {

        // Super Admin can access everything
        if (req.user.role === "super_admin") {
            return next();
        }

        // Get logged-in University Admin
        const admin = await User.findById(
            req.user.id
        );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "University admin not found"
            });
        }

        if (admin.role !== "university_admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        if (!admin.university) {
            return res.status(403).json({
                success: false,
                message:
                    "No university has been assigned to this admin"
            });
        }

        // Get university ID from request
        const universityId = req.params.id;

        // Compare university IDs
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


module.exports = {
    checkUniversityOwnership
};