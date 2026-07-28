const { User, University } = require("../models/universityModel");

// ======================================
// University Dashboard
// ======================================
exports.universityDashboard = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        if (!user || user.role !== "university_admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const university = await University.findById(user.university);

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        res.status(200).json({
            success: true,
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
// Update My University
// ======================================
exports.updateUniversity = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        if (!user || user.role !== "university_admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const university = await University.findByIdAndUpdate(
            user.university,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "University updated successfully",
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
// Delete My University
// ======================================
exports.deleteUniversity = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        if (!user || user.role !== "university_admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        await University.findByIdAndDelete(user.university);

        user.university = null;
        await user.save();

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