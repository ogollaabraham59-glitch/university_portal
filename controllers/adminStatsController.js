const {
    University,
    Course,
    Student,
    KcseResult
} = require("../models/universityModel");

// ======================================================
// GET SUPER ADMIN DASHBOARD STATISTICS
// ======================================================

const getAdminStatistics = async (req, res) => {
    try {
        // Make sure this endpoint is only used by super admin
        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Super admin only."
            });
        }

        // Run all counts at the same time
        const [
            universities,
            courses,
            students,
            pendingResults
        ] = await Promise.all([
            University.countDocuments({
                isActive: true
            }),

            Course.countDocuments({
                isActive: true
            }),

            Student.countDocuments(),

            KcseResult.countDocuments({
                status: "Pending"
            })
        ]);

        return res.status(200).json({
            success: true,
            statistics: {
                universities,
                courses,
                students,
                pendingResults
            }
        });

    } catch (error) {
        console.error(
            "Get admin statistics error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard statistics",
            error: error.message
        });
    }
};

module.exports = {
    getAdminStatistics
};