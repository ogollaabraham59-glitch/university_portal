
const { User } = require('../models/universityModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create the first admin account
exports.registerAdmin = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            phone,
            email,
            password,
            role,
            secretkey
        } = req.body;

        // Verify admin secret key
        if (secretkey !== process.env.SECRET_KEY) {
            return res.status(403).json({
                message: "Unauthorized access"
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

        // Create admin
        const user = new User({
            firstName,
            lastName,
            phone,
            email,
            password: hashedPassword,
            role: role || "university_admin",
            isVerified: true,
            student: null
        });

        const newUser = await user.save();

        res.status(201).json({
            message: "Admin account created successfully",
            user: newUser
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
//login
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
        const isMatch = await bcrypt.compare(password, user.password);

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