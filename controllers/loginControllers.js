const {
    User,
    UniversityAdmin
} = require('../models/universityModel');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// ======================================================
// REGISTER NORMAL USER / STUDENT
// ======================================================

exports.registerUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            phone,
            email,
            password
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !phone || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
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
            return res.status(400).json({
                message: "Email or phone already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create normal user
        const user = new User({
            firstName,
            lastName,
            phone,
            email,
            password: hashedPassword,

            // Never allow normal user to choose role
            role: "student",

            isVerified: true
        });

        const newUser = await user.save();

        res.status(201).json({
            message: "Account created successfully",
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                phone: newUser.phone,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// ======================================================
// REGISTER UNIVERSITY ADMIN
// ======================================================

exports.registerUniversityAdmin = async (req, res) => {
    try {

        const {
            name,
            email,
            phone,
            password,
            university
        } = req.body;


        // ----------------------------------------------
        // Validate required fields
        // ----------------------------------------------

        if (
            !name ||
            !email ||
            !phone ||
            !password ||
            !university
        ) {
            return res.status(400).json({
                message:
                    "Name, email, phone, password and university are required"
            });
        }


        // ----------------------------------------------
        // Check if email already exists
        // ----------------------------------------------

        const emailExists = await UniversityAdmin.findOne({
            email
        });

        if (emailExists) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }


        // ----------------------------------------------
        // Check if phone already exists
        // ----------------------------------------------

        const phoneExists = await UniversityAdmin.findOne({
            phone
        });

        if (phoneExists) {
            return res.status(400).json({
                message: "Phone number already exists"
            });
        }


        // ----------------------------------------------
        // Hash password
        // ----------------------------------------------

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // ----------------------------------------------
        // Create university admin
        // ----------------------------------------------

        const admin = new UniversityAdmin({
            name,
            email,
            phone,
            password: hashedPassword,

            // University this admin manages
            university,

            // Admin created by super admin
            isVerified: true,
            isActive: true
        });


        const newAdmin = await admin.save();


        // ----------------------------------------------
        // Response
        // ----------------------------------------------

        res.status(201).json({
            message: "University admin created successfully",

            admin: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                phone: newAdmin.phone,
                university: newAdmin.university,
                isVerified: newAdmin.isVerified,
                isActive: newAdmin.isActive
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// ======================================================
// LOGIN
// This keeps your existing normal-user login unchanged.
// ======================================================

exports.logIn = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "Invalid credentials"
            });
        }

        // Check account status
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Account has been deactivated"
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // Generate JWT
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

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};