
const { User, University } = require("../models/universityModel");
const bcrypt = require("bcrypt");

// ======================================================
// CREATE UNIVERSITY ADMIN
// Only SUPER ADMIN should be allowed to call this
// ======================================================

exports.registerUniversityAdmin = async (req, res) => {
    try {

        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            university
        } = req.body;


        // ======================================================
        // 1. VALIDATE REQUIRED FIELDS
        // ======================================================

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !password ||
            !university
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, email, phone, password and university are required"
            });
        }


        // ======================================================
        // 2. CHECK PASSWORD LENGTH
        // ======================================================

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }


        // ======================================================
        // 3. CHECK IF UNIVERSITY EXISTS
        // ======================================================

        const universityExists = await University.findById(university);

        if (!universityExists) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }


        // ======================================================
        // 4. CHECK IF UNIVERSITY IS ACTIVE
        // ======================================================

        if (!universityExists.isActive) {
            return res.status(400).json({
                success: false,
                message: "This university is inactive"
            });
        }


        // ======================================================
        // 5. CHECK IF EMAIL ALREADY EXISTS
        // ======================================================

        const emailExists = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (emailExists) {
            return res.status(409).json({
                success: false,
                message: "Email already taken"
            });
        }


        // ======================================================
        // 6. CHECK IF PHONE ALREADY EXISTS
        // ======================================================

        const phoneExists = await User.findOne({
            phone: phone.trim()
        });

        if (phoneExists) {
            return res.status(409).json({
                success: false,
                message: "Phone number already taken"
            });
        }


        // ======================================================
        // 7. HASH PASSWORD
        // ======================================================

        const hashedPassword = await bcrypt.hash(password, 10);


        // ======================================================
        // 8. CREATE UNIVERSITY ADMIN
        // ======================================================

        const user = new User({

            firstName: firstName.trim(),

            lastName: lastName.trim(),

            email: email.toLowerCase().trim(),

            phone: phone.trim(),

            password: hashedPassword,

            role: "university_admin",

            university: university,

            // Created by super admin
            isVerified: true,

            isActive: true
        });


        // ======================================================
        // 9. SAVE USER
        // ======================================================

        const newUser = await user.save();


        // ======================================================
        // 10. RETURN RESPONSE
        // Do NOT return password
        // ======================================================

        return res.status(201).json({

            success: true,

            message: "University admin account created successfully",

            admin: {
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                university: newUser.university,
                isVerified: newUser.isVerified,
                isActive: newUser.isActive
            }
        });


    } catch (error) {

        console.error(
            "Register university admin error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while creating university admin",

            error: error.message
        });
    }
};