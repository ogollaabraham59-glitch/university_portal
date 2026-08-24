const {
    User,
    University,
    Course,
    Profile
} = require("../models/universityModel");

const bcrypt = require("bcrypt");

// ======================================
// Helper: Make sure current user is Super Admin
// ======================================
const checkSuperAdmin = async (req, res) => {
    const admin = await User.findById(req.user.id);

    if (!admin) {
        res.status(401).json({
            success: false,
            message: "User not found or not authenticated"
        });

        return false;
    }

    if (admin.role !== "super_admin") {
        res.status(403).json({
            success: false,
            message: "Access denied. Super admin only."
        });

        return false;
    }

    return true;
};


// ======================================
// Super Admin Dashboard
// ======================================
exports.superAdminDashboard = async (req, res) => {
    try {

        const isSuperAdmin = await checkSuperAdmin(req, res);

        if (!isSuperAdmin) return;

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

        console.error("Super Admin Dashboard Error:", error);

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

        const isSuperAdmin = await checkSuperAdmin(req, res);

        if (!isSuperAdmin) return;

        const users = await User
            .find()
            .select("-password");

        res.status(200).json({
            success: true,
            total: users.length,
            users
        });

    } catch (error) {

        console.error("Get Users Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// Create University Admin
// ======================================
exports.createUniversityAdmin = async (req, res) => {
    try {

        const isSuperAdmin = await checkSuperAdmin(req, res);

        if (!isSuperAdmin) return;

        const {
            name,
            email,
            password,
            university
        } = req.body;

        // Validate fields
        if (!name || !email || !password || !university) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email, password and university are required"
            });
        }

        // Check university
        const universityExists = await University.findById(
            university
        );

        if (!universityExists) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        // Check email
        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const newAdmin = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "university_admin",
            university
        });

        res.status(201).json({
            success: true,
            message: "University admin created successfully",

            user: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role,
                university: newAdmin.university
            }
        });

    } catch (error) {

        console.error("Create University Admin Error:", error);

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

        const isSuperAdmin = await checkSuperAdmin(req, res);

        if (!isSuperAdmin) return;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Protect super admins
        if (user.role === "super_admin") {
            return res.status(403).json({
                success: false,
                message: "You cannot delete a super admin"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {

        console.error("Delete User Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// Create University
// ======================================
exports.createUniversity = async (req, res) => {
    try {

        const isSuperAdmin = await checkSuperAdmin(req, res);

        if (!isSuperAdmin) return;

        const {
            name,
            location,
            description,
            website
        } = req.body;

        if (!name || !location) {
            return res.status(400).json({
                success: false,
                message: "University name and location are required"
            });
        }

        // Check duplicate university
        const existingUniversity = await University.findOne({
            name
        });

        if (existingUniversity) {
            return res.status(409).json({
                success: false,
                message: "University already exists"
            });
        }

        const university = await University.create({
            name,
            location,
            description,
            website,
            verified: false
        });

        res.status(201).json({
            success: true,
            message: "University created successfully",
            university
        });

    } catch (error) {

        console.error("Create University Error:", error);

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

        const isSuperAdmin = await checkSuperAdmin(req, res);

        if (!isSuperAdmin) return;

        const universities = await University.find();

        res.status(200).json({
            success: true,
            total: universities.length,
            universities
        });

    } catch (error) {

        console.error("Get Universities Error:", error);

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

        const isSuperAdmin = await checkSuperAdmin(req, res);

        if (!isSuperAdmin) return;

        const university = await University.findByIdAndUpdate(
            req.params.id,
            {
                verified: true
            },
            {
                new: true
            }
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

        console.error("Verify University Error:", error);

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

        const isSuperAdmin = await checkSuperAdmin(req, res);

        if (!isSuperAdmin) return;

        const university = await University.findById(
            req.params.id
        );

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        // Delete admins belonging to this university
        await User.deleteMany({
            university: university._id,
            role: "university_admin"
        });

        // Delete courses belonging to university
        await Course.deleteMany({
            university: university._id
        });

        // Delete university
        await University.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message:
                "University and its admins/courses deleted successfully"
        });

    } catch (error) {

        console.error("Delete University Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// Create Course
// ======================================
exports.createCourse = async (req, res) => {
    try {

        const isSuperAdmin = await checkSuperAdmin(req, res);

        if (!isSuperAdmin) return;

        const {
            name,
            code,
            description,
            duration,
            fees,
            university
        } = req.body;

        if (!name || !university) {
            return res.status(400).json({
                success: false,
                message:
                    "Course name and university are required"
            });
        }

        // Check university
        const universityExists = await University.findById(
            university
        );

        if (!universityExists) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        // Check duplicate course
        const existingCourse = await Course.findOne({
            name,
            university
        });

        if (existingCourse) {
            return res.status(409).json({
                success: false,
                message:
                    "This course already exists in this university"
            });
        }

        const course = await Course.create({
            name,
            code,
            description,
            duration,
            fees,
            university
        });

        res.status(201).json({
            success: true,
            message: "Course created successfully",
            course
        });

    } catch (error) {

        console.error("Create Course Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// Get All Courses
// ======================================
exports.getAllCourses = async (req, res) => {
    try {

        const isSuperAdmin = await checkSuperAdmin(req, res);

        if (!isSuperAdmin) return;

        const courses = await Course
            .find()
            .populate("university", "name location");

        res.status(200).json({
            success: true,
            total: courses.length,
            courses
        });

    } catch (error) {

        console.error("Get Courses Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// Delete Course
// ======================================
exports.deleteCourse = async (req, res) => {
    try {

        const isSuperAdmin = await checkSuperAdmin(req, res);

        if (!isSuperAdmin) return;

        const course = await Course.findByIdAndDelete(
            req.params.id
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });

    } catch (error) {

        console.error("Delete Course Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};