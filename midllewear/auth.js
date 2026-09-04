const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const {
    User,
    Student
} = require("../models/universityModel");

// ======================================================
// HELPER: GENERATE JWT TOKEN
// ======================================================

const generateToken = (
    id,
    role,
    expiresIn = "5h"
) => {


    return jwt.sign(
        {
            id,
            role
        },
        JWT_SECRET,
        {
            expiresIn
        }
    );


};

// ======================================================
// MIDDLEWARE: AUTHENTICATION
// ======================================================

const auth = async (req, res, next) => {


    try {

        const authHeader =
            req.headers.authorization;

        // Check if token exists
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Access denied. No authentication token provided."
            });

        }

        // Extract token
        const token =
            authHeader.split(" ")[1];

        // Verify token
        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );

        // Attach user information to request
        req.user = decoded;

        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired token."
        });

    }


};

// ======================================================
// MIDDLEWARE: AUTHORIZATION
// ======================================================

const authorizeRoles =
    (...allowedRoles) => {


        return (req, res, next) => {

            if (
                !req.user ||
                !allowedRoles.includes(
                    req.user.role
                )
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Forbidden: You do not have permission to access this resource."
                });

            }

            next();

        };

    };


// ======================================================
// ADMIN LOGIN
// ======================================================

const loginAdmin = async (req, res) => {


    try {

        const {
            email,
            password
        } = req.body;

        // Validate input
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required"
            });

        }

        // Find administrator
        const admin =
            await User.findOne({

                email:
                    email
                        .toLowerCase()
                        .trim(),

                role: {
                    $in: [
                        "super_admin",
                        "university_admin"
                    ]
                }

            })
                .populate(
                    "university",
                    "name location"
                );


        if (!admin) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });

        }


        // Check account status
        if (!admin.isActive) {

            return res.status(403).json({
                success: false,
                message:
                    "Admin account has been deactivated"
            });

        }


        // Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                admin.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });

        }


        // Generate JWT token
        const token =
            generateToken(
                admin._id,
                admin.role
            );


        // Return response
        return res.status(200).json({

            success: true,

            message:
                "Admin login successful",

            token,

            admin: {

                id: admin._id,

                firstName:
                    admin.firstName,

                lastName:
                    admin.lastName,

                email:
                    admin.email,

                phone:
                    admin.phone,

                role:
                    admin.role,

                university:
                    admin.university,

                isVerified:
                    admin.isVerified

            }

        });

    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while logging in"

        });

    }

};

// ======================================================
// LOGOUT
// ======================================================

const logout = async (req, res) => {

    return res.status(200).json({

        success: true,

        message:
            "Logged out successfully"

    });


};

// ======================================================
// CHANGE PASSWORD
// ======================================================

const changePassword = async (
    req,
    res
) => {


    try {

        const {
            currentPassword,
            newPassword
        } = req.body;


        // Check authentication
        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "User not authenticated"

            });

        }


        // Validate fields
        if (
            !currentPassword ||
            !newPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Current and new password are required"

            });

        }


        // Password length
        if (newPassword.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must be at least 6 characters"

            });

        }


        let account;


        // Determine account type
        if (
            req.user.role === "student"
        ) {

            account =
                await Student.findById(
                    req.user.id
                );

        }

        else if (

            [
                "super_admin",
                "university_admin"
            ].includes(
                req.user.role
            )

        ) {

            account =
                await User.findById(
                    req.user.id
                );

        }


        // Check account
        if (
            !account ||
            !account.isActive
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Account not found or inactive"

            });

        }


        // Check current password
        const passwordMatch =
            await bcrypt.compare(

                currentPassword,

                account.password

            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Current password is incorrect"

            });

        }


        // Hash new password
        account.password =
            await bcrypt.hash(
                newPassword,
                10
            );


        await account.save();


        return res.status(200).json({

            success: true,

            message:
                "Password changed successfully"

        });

    } catch (error) {

        console.error(
            "Change password error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while changing password"

        });

    }
    ```

};

// ======================================================
// FORGOT PASSWORD
// ======================================================

const forgotPassword = async (
req,
res
) => {

```
    try {

        const {
            email
        } = req.body;


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required"

            });

        }


        const normalizedEmail =
            email
                .toLowerCase()
                .trim();


        // Check student first
        let account =
            await Student.findOne({

                email:
                    normalizedEmail

            });


        let accountType =
            "student";


        // Check admin if student doesn't exist
        if (!account) {

            account =
                await User.findOne({

                    email:
                        normalizedEmail

                });


            accountType =
                "admin";

        }


        // Security: Don't reveal whether email exists
        if (
            !account ||
            !account.isActive
        ) {

            return res.status(200).json({

                success: true,

                message:
                    "If the email exists, a password reset link will be sent"

            });

        }


        // Generate reset token
        const resetToken =
            jwt.sign(

                {

                    id: account._id,

                    purpose:
                        "password_reset",

                    accountType

                },

                JWT_SECRET,

                {

                    expiresIn:
                        "15m"

                }

            );


        // TEMPORARY
        // Later we will send this through email
        console.log(
            "Password reset token:",
            resetToken
        );


        return res.status(200).json({

            success: true,

            message:
                "If the email exists, a password reset link will be sent"

        });

    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error"

        });

    }
    ```

};

// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (
req,
res
) => {

```
    try {

        const {
            token,
            newPassword
        } = req.body;


        if (
            !token ||
            !newPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Reset token and new password are required"

            });

        }


        if (newPassword.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 6 characters"

            });

        }


        let decoded;


        // Verify reset token
        try {

            decoded =
                jwt.verify(
                    token,
                    JWT_SECRET
                );

        } catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid or expired reset token"

            });

        }


        // Verify token purpose
        if (
            decoded.purpose !==
            "password_reset"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid password reset token"

            });

        }


        let account;


        // Find correct account
        if (
            decoded.accountType ===
            "student"
        ) {

            account =
                await Student.findById(
                    decoded.id
                );

        } else {

            account =
                await User.findById(
                    decoded.id
                );

        }


        if (
            !account ||
            !account.isActive
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Account not found or inactive"

            });

        }


        // Update password
        account.password =
            await bcrypt.hash(
                newPassword,
                10
            );


        await account.save();


        return res.status(200).json({

            success: true,

            message:
                "Password reset successfully"

        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while resetting password"

        });

    }
    ```

};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {

```
    generateToken,

        auth,

        authorizeRoles,

        loginAdmin,

        logout,

        changePassword,

        forgotPassword,

        resetPassword


};
