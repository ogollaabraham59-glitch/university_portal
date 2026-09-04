const bcrypt = require("bcrypt");
const {
    Student,
    Course
} = require("../models/universityModel");


// ======================================================
// REGISTER STUDENT
// ======================================================

const registerStudent = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password
        } = req.body;

        // --------------------------------------------------
        // 1. VALIDATE REQUIRED FIELDS
        // --------------------------------------------------

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, email, phone and password are required"
            });
        }

        // --------------------------------------------------
        // 2. CLEAN INPUT
        // --------------------------------------------------

        const cleanFirstName = firstName.trim();
        const cleanLastName = lastName.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const cleanPhone = phone.trim();

        // --------------------------------------------------
        // 3. CHECK IF EMAIL ALREADY EXISTS
        // --------------------------------------------------

        const existingEmail = await Student.findOne({
            email: normalizedEmail
        });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // --------------------------------------------------
        // 4. CHECK IF PHONE ALREADY EXISTS
        // --------------------------------------------------

        const existingPhone = await Student.findOne({
            phone: cleanPhone
        });

        if (existingPhone) {
            return res.status(409).json({
                success: false,
                message: "Phone number already registered"
            });
        }

        // --------------------------------------------------
        // 5. HASH PASSWORD
        // --------------------------------------------------

        const hashedPassword = await bcrypt.hash(password, 10);

        // --------------------------------------------------
        // 6. PROFILE PICTURE
        // --------------------------------------------------

        let profilePicture = "";

        if (req.file) {
            profilePicture = req.file.path;
        }

        // --------------------------------------------------
        // 7. CREATE STUDENT
        // --------------------------------------------------

        const student = await Student.create({
            firstName: cleanFirstName,
            lastName: cleanLastName,
            email: normalizedEmail,
            phone: cleanPhone,
            password: hashedPassword,
            profilePicture,

            // Academic information will be completed
            // after registration.
            indexNo: "",
            yearOfCompletion: null,
            subjects: [],
            totalGrade: "",
            interestedCourses: [],

            isAcademicProfileComplete: false,
            isVerified: false,
            isActive: true
        });

        // --------------------------------------------------
        // 8. RETURN STUDENT INFORMATION
        // --------------------------------------------------

        return res.status(201).json({
            success: true,
            message: "Student registered successfully",

            student: {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                phone: student.phone,
                profilePicture: student.profilePicture,
                role: "student",

                isAcademicProfileComplete:
                    student.isAcademicProfileComplete,

                isVerified: student.isVerified,
                isActive: student.isActive
            }
        });

    } catch (error) {

        console.error(
            "Register student error:",
            error
        );

        // --------------------------------------------------
        // MONGOOSE DUPLICATE KEY ERROR
        // --------------------------------------------------

        if (error.code === 11000) {

            const duplicateField =
                Object.keys(error.keyPattern || {})[0];

            return res.status(409).json({
                success: false,
                message: `${duplicateField} already registered`
            });
        }

        // --------------------------------------------------
        // SERVER ERROR
        // --------------------------------------------------

        return res.status(500).json({
            success: false,
            message:
                "Server error while registering student",
            error: error.message
        });
    }
}

//student log in
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
// 1. GET MY STUDENT PROFILE
// ======================================================

const getStudentProfile = async (req, res) => {
    try {
        // Student ID comes from JWT
        const studentId = req.user.id;

        const student = await Student.findById(studentId)
            .populate(
                "interestedCourses",
                "courseName courseCode description duration minimumGrade"
            )
            .select("-password");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            student
        });

    } catch (error) {
        console.error("Get student profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting student profile",
            error: error.message
        });
    }
};

// ======================================================
// UPDATE STUDENT PROFILE
// ======================================================

const updateStudentProfile = async (req, res) => {
    try {

        // --------------------------------------------------
        // 1. GET STUDENT ID FROM JWT
        // --------------------------------------------------

        const studentId = req.user.id;

        // --------------------------------------------------
        // 2. GET DATA FROM REQUEST
        // --------------------------------------------------

        const {
            firstName,
            lastName,
            email,
            phone,
            indexNo,
            yearOfCompletion,
            subjects,
            totalGrade,
            interestedCourses
        } = req.body;

        // --------------------------------------------------
        // 3. FIND STUDENT
        // --------------------------------------------------

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // ==================================================
        // BASIC INFORMATION
        // ==================================================

        if (firstName !== undefined) {

            if (!firstName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "First name cannot be empty"
                });
            }

            student.firstName = firstName.trim();
        }

        if (lastName !== undefined) {

            if (!lastName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Last name cannot be empty"
                });
            }

            student.lastName = lastName.trim();
        }

        // ==================================================
        // EMAIL
        // ==================================================

        if (email !== undefined) {

            const normalizedEmail =
                email.trim().toLowerCase();

            if (!normalizedEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email cannot be empty"
                });
            }

            if (normalizedEmail !== student.email) {

                const existingEmail =
                    await Student.findOne({
                        email: normalizedEmail,
                        _id: { $ne: studentId }
                    });

                if (existingEmail) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "Email already belongs to another student"
                    });
                }

                student.email = normalizedEmail;
            }
        }

        // ==================================================
        // PHONE
        // ==================================================

        if (phone !== undefined) {

            const cleanPhone = phone.trim();

            if (!cleanPhone) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number cannot be empty"
                });
            }

            if (cleanPhone !== student.phone) {

                const existingPhone =
                    await Student.findOne({
                        phone: cleanPhone,
                        _id: { $ne: studentId }
                    });

                if (existingPhone) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "Phone number already belongs to another student"
                    });
                }

                student.phone = cleanPhone;
            }
        }

        // ==================================================
        // INDEX NUMBER
        // ==================================================

        if (indexNo !== undefined) {

            const cleanIndexNo = indexNo.trim();

            if (cleanIndexNo) {

                if (cleanIndexNo !== student.indexNo) {

                    const existingIndex =
                        await Student.findOne({
                            indexNo: cleanIndexNo,
                            _id: { $ne: studentId }
                        });

                    if (existingIndex) {
                        return res.status(409).json({
                            success: false,
                            message:
                                "Index number already belongs to another student"
                        });
                    }

                    student.indexNo = cleanIndexNo;
                }

            } else {
                student.indexNo = "";
            }
        }

        // ==================================================
        // YEAR OF COMPLETION
        // ==================================================

        if (yearOfCompletion !== undefined) {

            if (
                yearOfCompletion === null ||
                yearOfCompletion === ""
            ) {
                student.yearOfCompletion = null;

            } else {

                const year =
                    Number(yearOfCompletion);

                if (
                    !Number.isInteger(year) ||
                    year < 1900 ||
                    year > new Date().getFullYear()
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Please provide a valid year of completion"
                    });
                }

                student.yearOfCompletion = year;
            }
        }

        // ==================================================
        // SUBJECTS AND GRADES
        // ==================================================

        if (subjects !== undefined) {

            if (!Array.isArray(subjects)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Subjects must be an array"
                });
            }

            // Validate every subject
            for (const item of subjects) {

                if (
                    !item ||
                    typeof item.subject !== "string" ||
                    typeof item.grade !== "string"
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Each subject must contain subject and grade"
                    });
                }

                if (
                    !item.subject.trim() ||
                    !item.grade.trim()
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Subject name and grade cannot be empty"
                    });
                }
            }

            student.subjects = subjects.map(item => ({
                subject: item.subject.trim(),
                grade: item.grade.trim()
            }));
        }

        // ==================================================
        // TOTAL GRADE
        // ==================================================

        if (totalGrade !== undefined) {

            if (
                totalGrade === null ||
                totalGrade === ""
            ) {
                student.totalGrade = "";

            } else {

                student.totalGrade =
                    String(totalGrade).trim();
            }
        }

        // ==================================================
        // INTERESTED COURSES
        // ==================================================

        if (interestedCourses !== undefined) {

            if (!Array.isArray(interestedCourses)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Interested courses must be an array"
                });
            }

            // Maximum of 3 courses
            if (interestedCourses.length > 3) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A student can select a maximum of 3 courses"
                });
            }

            // Remove duplicate course IDs
            const uniqueCourses =
                [...new Set(
                    interestedCourses.map(
                        course => course.toString()
                    )
                )];

            if (
                uniqueCourses.length !==
                interestedCourses.length
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "You cannot select the same course more than once"
                });
            }

            // Check that courses actually exist
            if (uniqueCourses.length > 0) {

                const courses =
                    await Course.find({
                        _id: { $in: uniqueCourses },
                        isActive: true
                    });

                if (
                    courses.length !==
                    uniqueCourses.length
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "One or more selected courses do not exist or are inactive"
                    });
                }
            }

            student.interestedCourses =
                uniqueCourses;
        }

        // ==================================================
        // DETERMINE ACADEMIC PROFILE COMPLETION
        // ==================================================

        const hasSubjects =
            Array.isArray(student.subjects) &&
            student.subjects.length > 0;

        const hasIndexNo =
            typeof student.indexNo === "string" &&
            student.indexNo.trim() !== "";

        const hasYear =
            student.yearOfCompletion !== null &&
            student.yearOfCompletion !== undefined;

        const hasTotalGrade =
            typeof student.totalGrade === "string" &&
            student.totalGrade.trim() !== "";

        // Academic profile is complete only when
        // all required academic information exists.

        student.isAcademicProfileComplete =
            hasSubjects &&
            hasIndexNo &&
            hasYear &&
            hasTotalGrade;

        // ==================================================
        // SAVE
        // ==================================================

        await student.save();

        // ==================================================
        // REMOVE PASSWORD FROM RESPONSE
        // ==================================================

        const studentResponse =
            student.toObject();

        delete studentResponse.password;

        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({
            success: true,
            message:
                "Student profile updated successfully",
            student: studentResponse
        });

    } catch (error) {

        console.error(
            "Update student profile error:",
            error
        );

        // Mongoose duplicate key
        if (error.code === 11000) {

            const duplicateField =
                Object.keys(
                    error.keyPattern || {}
                )[0];

            return res.status(409).json({
                success: false,
                message:
                    `${duplicateField} already exists`
            });
        }

        // Mongoose validation error
        if (error.name === "ValidationError") {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid student profile data",
                error: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Server error while updating student profile",
            error: error.message
        });
    }
};




// ======================================================
// 3. UPDATE STUDENT PROFILE PICTURE
// ======================================================

const updateStudentPicture = async (req, res) => {
    try {
        const studentId = req.user.id;

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Multer should provide req.file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a profile picture"
            });
        }

        // Store uploaded file path
        student.profilePicture = req.file.path;

        await student.save();

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            profilePicture: student.profilePicture
        });

    } catch (error) {
        console.error("Update student picture error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating profile picture",
            error: error.message
        });
    }
};


// ======================================================
// 4. GET STUDENT BY ID
// ======================================================

const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id)
            .populate(
                "interestedCourses",
                "courseName courseCode description duration minimumGrade"
            )
            .select("-password");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.status(200).json({
            success: true,
            student
        });

    } catch (error) {
        console.error("Get student by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting student",
            error: error.message
        });
    }
};


// ======================================================
// 5. VERIFY STUDENT
// ======================================================

const verifyStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        student.isVerified = true;

        await student.save();

        return res.status(200).json({
            success: true,
            message: "Student verified successfully"
        });

    } catch (error) {
        console.error("Verify student error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while verifying student",
            error: error.message
        });
    }
};


// ======================================================
// 6. ACTIVATE STUDENT
// ======================================================

const activateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        student.isActive = true;

        await student.save();

        return res.status(200).json({
            success: true,
            message: "Student account activated successfully"
        });

    } catch (error) {
        console.error("Activate student error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while activating student",
            error: error.message
        });
    }
};


// ======================================================
// 7. DEACTIVATE STUDENT
// ======================================================

const deactivateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        student.isActive = false;

        await student.save();

        return res.status(200).json({
            success: true,
            message: "Student account deactivated successfully"
        });

    } catch (error) {
        console.error("Deactivate student error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deactivating student"
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getStudentProfile,
    updateStudentProfile,
    updateStudentPicture,
    getStudentById,
    registerStudent,
    loginStudent,
    verifyStudent,
    activateStudent,
    deactivateStudent
};