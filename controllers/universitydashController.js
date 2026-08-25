const { User, University } = require("../models/universityModel");

// ======================================
// GET MY UNIVERSITY
// University Admin
// ======================================
exports.universityDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role !== "university_admin") {
            return res.status(403).json({
                success: false,
                message: "Only university administrators can access this dashboard"
            });
        }

        if (!user.university) {
            return res.status(404).json({
                success: false,
                message: "No university is connected to this account"
            });
        }

        const university = await University.findById(user.university);

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        return res.status(200).json({
            success: true,
            university
        });

    } catch (error) {
        console.error("University dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// UPDATE MY UNIVERSITY
// University Admin
// ======================================
exports.updateUniversity = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role !== "university_admin") {
            return res.status(403).json({
                success: false,
                message: "Only university administrators can update a university"
            });
        }

        if (!user.university) {
            return res.status(404).json({
                success: false,
                message: "No university is connected to this account"
            });
        }

        const university = await University.findByIdAndUpdate(
            user.university,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "University updated successfully",
            university
        });

    } catch (error) {
        console.error("Update university error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// DELETE UNIVERSITY
// University Admin NOT ALLOWED
// ======================================
exports.deleteUniversity = async (req, res) => {
    return res.status(403).json({
        success: false,
        message: "University administrators are not allowed to delete universities. Contact a super administrator."
    });
};