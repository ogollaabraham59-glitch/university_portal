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
// 2. UPDATE STUDENT PROFILE
// ======================================================

const updateStudentProfile = async (req, res) => {
    try {
        const studentId = req.user.id;

        const {
            firstName,
            lastName,
            email,
            phone,
            indexNo,
            yearOfCompletion,
            subjects,
            interestedCourses
        } = req.body;

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // ------------------------------------------
        // Update basic information
        // ------------------------------------------

        if (firstName !== undefined) {
            student.firstName = firstName;
        }

        if (lastName !== undefined) {
            student.lastName = lastName;
        }

        // ------------------------------------------
        // Check email uniqueness
        // ------------------------------------------

        if (email !== undefined && email !== student.email) {

            const existingEmail = await Student.findOne({
                email: email.toLowerCase(),
                _id: { $ne: studentId }
            });

            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: "Email already belongs to another student"
                });
            }

            student.email = email.toLowerCase();
        }

        // ------------------------------------------
        // Check phone uniqueness
        // ------------------------------------------

        if (phone !== undefined && phone !== student.phone) {

            const existingPhone = await Student.findOne({
                phone,
                _id: { $ne: studentId }
            });

            if (existingPhone) {
                return res.status(409).json({
                    success: false,
                    message: "Phone number already belongs to another student"
                });
            }

            student.phone = phone;
        }

        // ------------------------------------------
        // Academic information
        // ------------------------------------------

        if (indexNo !== undefined) {

            const existingIndex = await Student.findOne({
                indexNo,
                _id: { $ne: studentId }
            });

            if (existingIndex) {
                return res.status(409).json({
                    success: false,
                    message: "Index number already belongs to another student"
                });
            }

            student.indexNo = indexNo;
        }

        if (yearOfCompletion !== undefined) {
            student.yearOfCompletion = yearOfCompletion;
        }

        // ------------------------------------------
        // Subjects and grades
        // ------------------------------------------

        if (subjects !== undefined) {

            if (!Array.isArray(subjects)) {
                return res.status(400).json({
                    success: false,
                    message: "Subjects must be an array"
                });
            }

            student.subjects = subjects;
        }

        // ------------------------------------------
        // Interested courses
        // ------------------------------------------

        if (interestedCourses !== undefined) {

            if (!Array.isArray(interestedCourses)) {
                return res.status(400).json({
                    success: false,
                    message: "Interested courses must be an array"
                });
            }

            if (interestedCourses.length > 3) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A student can select a maximum of 3 courses"
                });
            }

            // Make sure all courses exist
            const courses = await Course.find({
                _id: { $in: interestedCourses }
            });

            if (courses.length !== interestedCourses.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more selected courses do not exist"
                });
            }

            student.interestedCourses = interestedCourses;
        }

        // ------------------------------------------
        // Determine academic profile completion
        // ------------------------------------------

        const hasSubjects =
            Array.isArray(student.subjects) &&
            student.subjects.length > 0;

        const hasIndexNo =
            student.indexNo &&
            student.indexNo.trim() !== "";

        const hasYear =
            student.yearOfCompletion;

        const hasTotalGrade =
            student.totalGrade &&
            student.totalGrade.trim() !== "";

        if (
            hasSubjects &&
            hasIndexNo &&
            hasYear &&
            hasTotalGrade
        ) {
            student.isAcademicProfileComplete = true;
        } else {
            student.isAcademicProfileComplete = false;
        }

        await student.save();

        // Remove password from response
        const studentResponse = student.toObject();
        delete studentResponse.password;

        return res.status(200).json({
            success: true,
            message: "Student profile updated successfully",
            student: studentResponse
        });

    } catch (error) {
        console.error("Update student profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating student profile",
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
    verifyStudent,
    activateStudent,
    deactivateStudent
};