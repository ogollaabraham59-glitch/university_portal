const { Profile, User } = require("../models/universityModel");

// ===============================
// Add Student Profile
// ===============================
exports.addStudentProfile = async (req, res) => {
    try {

        const {
            user,
            gender,
            dateOfBirth,
            county,
            kcseYear,
            meanGrade,
            interests
        } = req.body;

        // Check whether user exists
        const existingUser = await User.findById(user);

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check whether profile already exists
        const existingProfile = await Profile.findOne({ user });

        if (existingProfile) {
            return res.status(400).json({
                message: "Student profile already exists"
            });
        }

        const profile = await Profile.create({
            user,
            gender,
            dateOfBirth,
            county,
            kcseYear,
            meanGrade,
            interests
        });

        res.status(201).json({
            message: "Student profile created successfully",
            profile
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ===============================
// Get All Student Profiles
// ===============================
exports.getAllStudentProfiles = async (req, res) => {
    try {

        const profiles = await Profile.find().populate("user");

        res.status(200).json(profiles);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ===============================
// Get Student Profile By ID
// ===============================
exports.getStudentProfileById = async (req, res) => {
    try {

        const profile = await Profile.findById(req.params.id)
            .populate("user");

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        res.status(200).json(profile);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ===============================
// Update Student Profile
// ===============================
exports.updateStudentProfile = async (req, res) => {
    try {

        const updatedProfile = await Profile.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProfile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            updatedProfile
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ===============================
// Delete Student Profile
// ===============================
exports.deleteStudentProfile = async (req, res) => {
    try {

        const deletedProfile = await Profile.findByIdAndDelete(req.params.id);

        if (!deletedProfile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        res.status(200).json({
            message: "Profile deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};