
const { User, University } = require("../models/universityModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// ======================================================
// 1. CREATE FIRST SUPER ADMIN
// ======================================================

exports.registerAdmin = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            secretkey
        } = req.body;

        // Verify required fields
        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !password ||
            !secretkey
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Verify secret key
        if (secretkey !== process.env.secretKey) {
            return res.status(403).json({
                success: false,
                message: "Authorization denied"
            });
        }

        // Check if user already exists
        const userExist = await User.findOne({
            $or: [
                { email },
                { phone }
            ]
        });

        if (userExist) {
            return res.status(409).json({
                success: false,
                message: "Email or phone number already taken"
            });
        }

        // Password must be at least 6 characters
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Super Admin
        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            role: "super_admin",
            university: null,
            isActive: true,
            isVerified: true
        });

        // Save user
        const newUser = await user.save();

        return res.status(201).json({
            success: true,
            message: "Super Admin account created successfully",
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Register Super Admin Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating Super Admin",
            error: error.message
        });
    }
};


// ======================================================
// 3. LOGIN
// ======================================================

exports.logIn = async (req, res) => {
    try {

        const { email, password } = req.body;


        // --------------------------------------------------
        // Check required fields
        // --------------------------------------------------

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }


        // --------------------------------------------------
        // Find user
        // --------------------------------------------------

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }


        // --------------------------------------------------
        // Check active account
        // --------------------------------------------------

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account has been deactivated"
            });
        }


        // --------------------------------------------------
        // Compare password
        // --------------------------------------------------

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }


        // --------------------------------------------------
        // Generate JWT
        // --------------------------------------------------

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "4h"
            }
        );


        // --------------------------------------------------
        // Login response
        // --------------------------------------------------

        return res.json({
            success: true,
            message: "Login successful",

            token,

            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                university: user.university
            }
        });

    } catch (error) {

        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during login",
            error: error.message
        });
    }
};
