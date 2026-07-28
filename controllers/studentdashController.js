const { User, Profile } = require("../models/universityModel");

// ======================================
// Student Dashboard
// ======================================
exports.studentDashboard = async (req, res) => {
    try {

        const userId = req.user.id;

        // Get student
        const student = await User.findById(userId)
            .select("-password");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Get profile
        const profile = await Profile.findOne({ user: userId });

        res.status(200).json({
            success: true,
            message: "Student dashboard loaded successfully",
            data: {
                student,
                profile
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
// Dashboard Statistics
// ======================================
exports.dashboardStatistics = async (req, res) => {

    try {

        const profile = await Profile.findOne({
            user: req.user.id
        });

        res.status(200).json({

            success: true,

            statistics: {

                profileCompleted: profile ? true : false,

                interests: profile ? profile.interests.length : 0,

                county: profile ? profile.county : null,

                meanGrade: profile ? profile.meanGrade : null,

                kcseYear: profile ? profile.kcseYear : null

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
// Get Student Profile
// ======================================
exports.getStudentProfile = async (req, res) => {

    try {

        const profile = await Profile.findOne({
            user: req.user.id
        }).populate("user", "-password");

        if (!profile) {

            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });

        }

        res.status(200).json({
            success: true,
            profile
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================
// Update Student Profile
// ======================================
exports.updateStudentProfile = async (req, res) => {

    try {

        const profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!profile) {

            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });

        }

        res.status(200).json({

            success: true,

            message: "Profile updated successfully",

            profile

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================
// Delete Student Profile
// ======================================
exports.deleteStudentProfile = async (req, res) => {

    try {

        const profile = await Profile.findOneAndDelete({
            user: req.user.id
        });

        if (!profile) {

            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });

        }

        res.status(200).json({

            success: true,

            message: "Profile deleted successfully"

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};