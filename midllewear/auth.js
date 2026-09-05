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
    expiresIn = "4h"
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

        const authHeader = req.headers.authorization;

        // Check token
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
        const token = authHeader.split(" ")[1];

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Authentication token is missing."
            });

        }

        // Verify token
        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        // Store authenticated user information
        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });

    }
};


// ======================================================
// MIDDLEWARE: ROLE AUTHORIZATION
// ======================================================

const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "User is not authenticated."
            });

        }

        if (
            !allowedRoles.includes(req.user.role)
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
// MIDDLEWARE: UNIVERSITY ADMIN OWNERSHIP
// ======================================================
//
// This ensures a university_admin can only manage
// the university assigned to their account.
//
// super_admin is allowed to manage any university.
//

const authorizeUniversity = async (
    req,
    res,
    next
) => {

    try {

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "User is not authenticated."
            });

        }

        // Super admin can access any university
        if (
            req.user.role === "super_admin"
        ) {

            return next();

        }

        // Only university admins need ownership checking
        if (
            req.user.role !== "university_admin"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Only university administrators can access this resource."
            });

        }

        // Get admin account
        const admin = await User.findById(
            req.user.id
        );

        if (!admin) {

            return res.status(404).json({
                success: false,
                message: "Administrator account not found."
            });

        }

        if (!admin.isActive) {

            return res.status(403).json({
                success: false,
                message: "Administrator account is inactive."
            });

        }

        // University must be assigned
        if (!admin.university) {

            return res.status(403).json({
                success: false,
                message:
                    "No university is assigned to this administrator."
            });

        }

        /*
         * We support university ID coming from:
         *
         * req.params.universityId
         * req.body.university
         * req.params.id
         *
         * The exact one used depends on the route/controller.
         */

        const requestedUniversity =
            req.params.universityId ||
            req.body.university;

        // If the route does not specify a university,
        // allow the controller to perform its own lookup.
        if (!requestedUniversity) {

            req.universityAdmin = admin;

            return next();

        }

        // Compare assigned university with requested university
        if (
            admin.university.toString() !==
            requestedUniversity.toString()
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Access denied. You can only manage your own university."
            });

        }

        // Store admin information for controllers
        req.universityAdmin = admin;

        next();

    } catch (error) {

        console.error(
            "University authorization error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while checking university authorization."
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

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });

        }

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

        if (newPassword.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters"
            });

        }

        let account;

        // Student
        if (
            req.user.role === "student"
        ) {

            account = await Student.findById(
                req.user.id
            );

        }

        // Admin
        else if (
            [
                "super_admin",
                "university_admin"
            ].includes(req.user.role)
        ) {

            account = await User.findById(
                req.user.id
            );

        }

        else {

            return res.status(403).json({
                success: false,
                message: "Invalid account role."
            });

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

        // Check old password
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
};


// ======================================================
// FORGOT PASSWORD
// ======================================================

const forgotPassword = async (
    req,
    res
) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Email is required"
            });

        }

        const normalizedEmail =
            email.toLowerCase().trim();

        // Check student
        let account =
            await Student.findOne({
                email: normalizedEmail
            });

        let accountType = "student";

        // Check admin
        if (!account) {

            account =
                await User.findOne({
                    email: normalizedEmail
                });

            accountType = "admin";
        }

        // Do not reveal whether email exists
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
                    purpose: "password_reset",
                    accountType
                },
                JWT_SECRET,
                {
                    expiresIn: "15m"
                }
            );

        // TEMPORARY
        // Replace with email service later
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
            message: "Server error"
        });

    }
};


// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (
    req,
    res
) => {

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

        try {

            decoded = jwt.verify(
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

        // Student
        if (
            decoded.accountType ===
            "student"
        ) {

            account =
                await Student.findById(
                    decoded.id
                );

        }

        // Admin
        else if (
            decoded.accountType === "admin"
        ) {

            account =
                await User.findById(
                    decoded.id
                );

        }

        else {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid account type"
            });

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
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

    generateToken,

    auth,

    authorizeRoles,

    authorizeUniversity,

    logout,

    changePassword,

    forgotPassword,

    resetPassword

};