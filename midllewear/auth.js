const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User, Student } = require("../models/universityModel");

const JWT_SECRET = process.env.JWT_SECRET;

// ======================================================
// HELPER: GENERATE JWT TOKEN
// ======================================================
const generateToken = (id, role, expiresIn = "5hrs") => {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn });
};

// ======================================================
// MIDDLEWARE: AUTHENTICATION
// ======================================================
const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No authentication token provided."
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded; // Attach decoded user info (id, role) to request object
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

// ======================================================
// MIDDLEWARE: AUTHORIZATION (ROLE CHECK)
// ======================================================
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You do not have permission to access this resource."
            });
        }
        next();
    };
};

// ======================================================
// 1. REGISTER STUDENT
// ======================================================
const registerStudent = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            indexNo,
            yearOfCompletion,
            subjects,
            interestedCourses
        } = req.body;

        if (!firstName || !lastName || !email || !phone || !password || !indexNo || !yearOfCompletion) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check for duplicates in parallel
        const [existingEmail, existingPhone, existingIndex] = await Promise.all([
            Student.findOne({ email: normalizedEmail }),
            Student.findOne({ phone: phone.trim() }),
            Student.findOne({ indexNo: indexNo.trim() })
        ]);

        if (existingEmail) return res.status(409).json({ success: false, message: "Email already registered" });
        if (existingPhone) return res.status(409).json({ success: false, message: "Phone number already registered" });
        if (existingIndex) return res.status(409).json({ success: false, message: "Index number already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await Student.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            password: hashedPassword,
            indexNo: indexNo.trim(),
            yearOfCompletion,
            subjects: subjects || [],
            interestedCourses: interestedCourses || [],
            isAcademicProfileComplete: false,
            isVerified: false,
            isActive: true
        });

        const token = generateToken(student._id, "student");

        return res.status(201).json({
            success: true,
            message: "Student registered successfully",
            token,
            student: {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                phone: student.phone,
                role: "student",
                isAcademicProfileComplete: student.isAcademicProfileComplete,
                isVerified: student.isVerified
            }
        });
    } catch (error) {
        console.error("Register student error:", error);
        return res.status(500).json({ success: false, message: "Server error while registering student" });
    }
};

// ======================================================
// 2. LOGIN STUDENT
// ======================================================
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const student = await Student.findOne({ email: email.toLowerCase().trim() });
        if (!student) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        if (!student.isActive) {
            return res.status(403).json({ success: false, message: "Your account has been deactivated" });
        }

        const passwordMatch = await bcrypt.compare(password, student.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = generateToken(student._id, "student");

        return res.status(200).json({
            success: true,
            message: "Student login successful",
            token,
            student: {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                phone: student.phone,
                role: "student",
                isAcademicProfileComplete: student.isAcademicProfileComplete,
                isVerified: student.isVerified
            }
        });
    } catch (error) {
        console.error("Student login error:", error);
        return res.status(500).json({ success: false, message: "Server error while logging in" });
    }
};

// ======================================================
// 3. LOGIN ADMIN
// ======================================================
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const admin = await User.findOne({
            email: email.toLowerCase().trim(),
            role: { $in: ["super_admin", "university_admin"] }
        }).populate("university", "name location");

        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        if (!admin.isActive) {
            return res.status(403).json({ success: false, message: "Admin account has been deactivated" });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = generateToken(admin._id, admin.role);

        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            token,
            admin: {
                id: admin._id,
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                phone: admin.phone,
                role: admin.role,
                university: admin.university,
                isVerified: admin.isVerified
            }
        });
    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({ success: false, message: "Server error while logging in" });
    }
};

// ======================================================
// 4. LOGOUT
// ======================================================
const logout = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

// ======================================================
// 5. CHANGE PASSWORD
// ======================================================
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!req.user) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
        }

        let account;
        if (req.user.role === "student") {
            account = await Student.findById(req.user.id);
        } else if (["super_admin", "university_admin"].includes(req.user.role)) {
            account = await User.findById(req.user.id);
        }

        if (!account || !account.isActive) {
            return res.status(404).json({ success: false, message: "Account not found or inactive" });
        }

        const passwordMatch = await bcrypt.compare(currentPassword, account.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        account.password = await bcrypt.hash(newPassword, 10);
        await account.save();

        return res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({ success: false, message: "Server error while changing password" });
    }
};

// ======================================================
// 6. FORGOT PASSWORD
// ======================================================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const normalizedEmail = email.toLowerCase().trim();

        let account = await Student.findOne({ email: normalizedEmail });
        let accountType = "student";

        if (!account) {
            account = await User.findOne({ email: normalizedEmail });
            accountType = "admin";
        }

        if (!account || !account.isActive) {
            return res.status(200).json({
                success: true,
                message: "If the email exists, a password reset link will be sent"
            });
        }

        const resetToken = jwt.sign(
            { id: account._id, purpose: "password_reset", accountType },
            JWT_SECRET,
            { expiresIn: "15m" }
        );

        console.log("Password reset token:", resetToken);

        return res.status(200).json({
            success: true,
            message: "If the email exists, a password reset link will be sent"
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ======================================================
// 7. RESET PASSWORD
// ======================================================
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: "Reset token and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        if (decoded.purpose !== "password_reset") {
            return res.status(400).json({ success: false, message: "Invalid password reset token" });
        }

        let account;
        if (decoded.accountType === "student") {
            account = await Student.findById(decoded.id);
        } else {
            account = await User.findById(decoded.id);
        }

        if (!account || !account.isActive) {
            return res.status(404).json({ success: false, message: "Account not found or inactive" });
        }

        account.password = await bcrypt.hash(newPassword, 10);
        await account.save();

        return res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ success: false, message: "Server error while resetting password" });
    }
};

// ======================================================
// EXPORTS
// ======================================================
module.exports = {
    auth,
    authorizeRoles,
    registerStudent,
    loginStudent,
    loginAdmin,
    logout,
    changePassword,
    forgotPassword,
    resetPassword
};