const mongoose = require("mongoose");


// ======================================================
// 1. USER SCHEMA
// Super Admin / University Admin
// ======================================================

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        profilePicture: {
            type: String,
            default: ""
        },

        role: {
            type: String,
            enum: [
                "super_admin",
                "university_admin"
            ],
            required: true
        },

        // University managed by this admin
        // Super Admin = null
        // University Admin = University ID
        university: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "University",
            default: null
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model(
    "User",
    userSchema
);


// ======================================================
// 2. STUDENT SCHEMA
// Student Account + Academic Information
// ======================================================

const studentSchema = new mongoose.Schema(
    {
        // ==============================================
        // ACCOUNT INFORMATION
        // ==============================================

        firstName: {
            type: String,
            required: true,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        profilePicture: {
            type: String,
            default: ""
        },

        // ==============================================
        // ACADEMIC INFORMATION
        // ==============================================

        indexNo: {
            type: String,

            trim: true,
            default: null
        },

        yearOfCompletion: {
            type: Number,
            default: null
        },

        // ==============================================
        // SUBJECTS AND GRADES
        // ==============================================

        subjects: [
            {
                subject: {
                    type: String,
                    required: true,
                    trim: true
                },

                grade: {
                    type: String,
                    required: true,
                    trim: true
                }
            }
        ],

        // Calculated by the backend
        totalGrade: {
            type: String,
            trim: true
        },

        // ==============================================
        // THREE COURSE INTERESTS
        // ==============================================

        interestedCourses: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Course"
                }
            ],

            // Maximum of 3 courses
            validate: {
                validator: function (courses) {
                    return courses.length <= 3;
                },

                message:
                    "A student can select a maximum of 3 courses."
            }
        },

        // ==============================================
        // PROFILE STATUS
        // ==============================================

        isAcademicProfileComplete: {
            type: Boolean,
            default: false
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Student = mongoose.model(
    "Student",
    studentSchema
);


// ======================================================
// 3. UNIVERSITY SCHEMA
// ======================================================

const universitySchema = new mongoose.Schema(
    {
        // ==============================================
        // BASIC INFORMATION
        // ==============================================

        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        county: {
            type: String,
            trim: true
        },

        country: {
            type: String,
            default: "Kenya",
            trim: true
        },

        universityType: {
            type: String,
            enum: [
                "Public",
                "Private"
            ]
        },

        establishedYear: {
            type: Number
        },

        // ==============================================
        // CONTACT INFORMATION
        // ==============================================

        website: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            trim: true
        },

        // ==============================================
        // UNIVERSITY BRANDING
        // ==============================================

        logo: {
            type: String,
            default: ""
        },

        // ==============================================
        // UNIVERSITY DESCRIPTION
        // ==============================================

        description: {
            type: String,
            trim: true
        },

        // ==============================================
        // FACILITIES
        // ==============================================

        facilities: {
            type: [String],
            default: []
        },

        // ==============================================
        // STATUS
        // ==============================================

        verified: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const University = mongoose.model(
    "University",
    universitySchema
);


// ======================================================
// 4. COURSE CATEGORY SCHEMA
// ======================================================
//
// Examples:
// Computing
// Engineering
// Medicine
// Business
// Education
// Agriculture
// Law
//
// ======================================================

const courseCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const CourseCategory = mongoose.model(
    "CourseCategory",
    courseCategorySchema
);


// ======================================================
// 5. COURSE SCHEMA
// Course Information + Eligibility Requirements
// ======================================================

const courseSchema = new mongoose.Schema(
    {
        // ==============================================
        // COURSE INFORMATION
        // ==============================================

        courseName: {
            type: String,
            required: true,
            trim: true
        },

        courseCode: {
            type: String,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        duration: {
            type: String,
            trim: true
        },

        department: {
            type: String,
            trim: true
        },

        // ==============================================
        // COURSE CATEGORY
        // ==============================================

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseCategory"
        },

        // ==============================================
        // MINIMUM OVERALL GRADE
        // ==============================================

        minimumGrade: {
            type: String,
            required: true,
            trim: true
        },

        // ==============================================
        // SUBJECT REQUIREMENTS
        // ==============================================

        requirements: [
            {
                subject: {
                    type: String,
                    required: true,
                    trim: true
                },

                minimumGrade: {
                    type: String,
                    required: true,
                    trim: true
                }
            }
        ],

        // ==============================================
        // MODE OF STUDY
        // ==============================================

        mode: {
            type: String,
            enum: [
                "Full Time",
                "Part Time",
                "Online"
            ],
            default: "Full Time"
        },

        // ==============================================
        // STATUS
        // ==============================================

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Course = mongoose.model(
    "Course",
    courseSchema
);


// ======================================================
// 6. UNIVERSITY COURSE SCHEMA
// Connects University <----> Course
// ======================================================

const universityCourseSchema = new mongoose.Schema(
    {
        // ==============================================
        // UNIVERSITY
        // ==============================================

        university: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "University",
            required: true
        },

        // ==============================================
        // COURSE
        // ==============================================

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        // ==============================================
        // CAMPUS
        // ==============================================

        campus: {
            type: String,
            trim: true
        },

        // ==============================================
        // FEES
        // ==============================================

        annualFees: {
            type: Number,
            min: 0
        },

        applicationFee: {
            type: Number,
            min: 0
        },

        // ==============================================
        // MODE OF STUDY
        // ==============================================

        mode: {
            type: String,
            enum: [
                "Full Time",
                "Part Time",
                "Online"
            ],
            default: "Full Time"
        },

        // ==============================================
        // INTAKES
        // ==============================================

        intake: {
            type: [String],
            default: []
        },

        // ==============================================
        // APPLICATION LINK
        // ==============================================

        applicationLink: {
            type: String,
            trim: true
        },

        // ==============================================
        // AVAILABILITY
        // ==============================================

        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);


// ======================================================
// PREVENT DUPLICATE UNIVERSITY + COURSE
// ======================================================

universityCourseSchema.index(
    {
        university: 1,
        course: 1
    },
    {
        unique: true
    }
);

const UniversityCourse = mongoose.model(
    "UniversityCourse",
    universityCourseSchema
);


// ======================================================
// 7. SAVED COURSE SCHEMA
// Student saves courses they are interested in
// ======================================================

const savedCourseSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        }
    },
    {
        timestamps: true
    }
);


// ======================================================
// PREVENT STUDENT SAVING SAME COURSE TWICE
// ======================================================

savedCourseSchema.index(
    {
        student: 1,
        course: 1
    },
    {
        unique: true
    }
);

const SavedCourse = mongoose.model(
    "SavedCourse",
    savedCourseSchema
);


// ======================================================
// 8. SAVED UNIVERSITY SCHEMA
// Student saves universities they are interested in
// ======================================================

const savedUniversitySchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        university: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "University",
            required: true
        }
    },
    {
        timestamps: true
    }
);


// ======================================================
// PREVENT STUDENT SAVING SAME UNIVERSITY TWICE
// ======================================================

savedUniversitySchema.index(
    {
        student: 1,
        university: 1
    },
    {
        unique: true
    }
);

const SavedUniversity = mongoose.model(
    "SavedUniversity",
    savedUniversitySchema
);


// ======================================================
// 9. NOTIFICATION SCHEMA
// ======================================================

const notificationSchema = new mongoose.Schema(
    {
        // ==============================================
        // RECIPIENT
        // ==============================================

        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        recipientType: {
            type: String,
            enum: [
                "Student",
                "User"
            ],
            required: true
        },

        // ==============================================
        // NOTIFICATION CONTENT
        // ==============================================

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        // ==============================================
        // NOTIFICATION TYPE
        // ==============================================

        type: {
            type: String,
            enum: [
                "application",
                "recommendation",
                "course",
                "university",
                "system"
            ],
            default: "system"
        },

        // ==============================================
        // READ STATUS
        // ==============================================

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Notification = mongoose.model(
    "Notification",
    notificationSchema
);


// ======================================================
// 10. KCSE RESULT SCHEMA
// For KCSE Result Slip Upload
// ======================================================

const kcseResultSchema = new mongoose.Schema(
    {
        // ==============================================
        // STUDENT
        // ==============================================

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        // ==============================================
        // RESULT SLIP
        // ==============================================

        resultSlip: {
            type: String,
            required: true
        },

        // ==============================================
        // PROCESSING STATUS
        // ==============================================

        status: {
            type: String,
            enum: [
                "Pending",
                "Processed",
                "Failed"
            ],
            default: "Pending"
        },

        // ==============================================
        // EXTRACTED SUBJECTS
        // ==============================================

        extractedSubjects: [
            {
                subject: {
                    type: String,
                    trim: true
                },

                grade: {
                    type: String,
                    trim: true
                }
            }
        ],

        // ==============================================
        // EXTRACTED INDEX NUMBER
        // ==============================================

        extractedIndexNo: {
            type: String,
            trim: true
        },

        // ==============================================
        // EXTRACTED YEAR
        // ==============================================

        extractedYear: {
            type: Number
        },

        // ==============================================
        // EXTRACTED TOTAL GRADE
        // ==============================================

        extractedTotalGrade: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const KcseResult = mongoose.model(
    "KcseResult",
    kcseResultSchema
);


// ======================================================
// EXPORT ALL MODELS
// ======================================================

module.exports = {
    User,
    Student,
    University,
    Course,
    UniversityCourse,
    SavedCourse,
    SavedUniversity,
    Notification,
    CourseCategory,
    KcseResult
};