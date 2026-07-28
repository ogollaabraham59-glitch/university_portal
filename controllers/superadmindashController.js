const {
    User,
    University,
    Course,
    Profile
} = require("../models/universityModel");

// ======================================
// Super Admin Dashboard
// ======================================
exports.superAdminDashboard = async (req, res) => {
    try {

        // Ensure user is Super Admin
        const admin = await User.findById(req.user.id);

        if (!admin || admin.role !== "super_admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Statistics
        const totalStudents = await User.countDocuments({
            role: "student"
        });

        const totalUniversityAdmins = await User.countDocuments({
            role: "university_admin"
        });

        const totalUniversities = await University.countDocuments();

        const totalCourses = await Course.countDocuments();

        const totalProfiles = await Profile.countDocuments();

        const verifiedUniversities = await University.countDocuments({
            verified: true
        });

        res.status(200).json({
            success: true,
            dashboard: {
                totalStudents,
                totalUniversityAdmins,
                totalUniversities,
                totalCourses,
                totalProfiles,
                verifiedUniversities
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ======================================
// Get All Users
// ======================================
exports.getAllUsers = async (req, res) => {

    try {

        const users = await User.find().select("-password");

        res.status(200).json({
            success: true,
            total: users.length,
            users
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================
// Get All Universities
// ======================================
exports.getAllUniversities = async (req, res) => {

    try {

        const universities = await University.find();

        res.status(200).json({
            success: true,
            total: universities.length,
            universities
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================
// Verify University
// ======================================
exports.verifyUniversity = async (req, res) => {

    try {

        const university = await University.findByIdAndUpdate(
            req.params.id,
            { verified: true },
            { new: true }
        );

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "University verified successfully",
            university
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================
// Delete User
// ======================================
exports.deleteUser = async (req, res) => {

    try {

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================
// Delete University
// ======================================
exports.deleteUniversity = async (req, res) => {

    try {

        const university = await University.findByIdAndDelete(req.params.id);

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "University deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};