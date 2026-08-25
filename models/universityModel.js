const mongoose = require("mongoose");

// ======================================================
// USER SCHEMA
// Normal users / students
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
            required: true
        },

        profilePicture: {
            type: String,
            default: ""
        },

        role: {
            type: String,
            enum: [
                "student",
                "super_admin"
            ],
            default: "student"
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

const User = mongoose.model("User", userSchema);


// ======================================================
// UNIVERSITY ADMIN SCHEMA
// ======================================================

const universityAdminSchema = new mongoose.Schema(
    {
        name: {
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

        // University this admin manages
        university: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "University",
            required: true
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

const UniversityAdmin = mongoose.model(
    "UniversityAdmin",
    universityAdminSchema
);


// ======================================================
// STUDENT PROFILE SCHEMA
// ======================================================

const studentProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        gender: {
            type: String,
            trim: true
        },

        dateOfBirth: {
            type: Date
        },

        county: {
            type: String,
            trim: true
        },

        kcseYear: {
            type: Number
        },

        meanGrade: {
            type: String,
            trim: true
        },

        interests: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Profile = mongoose.model(
    "profile",
    studentProfileSchema
);


// ======================================================
// KCSE RESULT SCHEMA
// ======================================================

const kcseResultSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        resultSlip: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Processed"
            ],
            default: "Pending"
        },

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
        ]
    },
    {
        timestamps: true
    }
);

const Kcse = mongoose.model(
    "kcse",
    kcseResultSchema
);


// ======================================================
// UNIVERSITY SCHEMA
// ======================================================

const universitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            trim: true
        },

        county: {
            type: String,
            trim: true
        },

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

        logo: {
            type: String,
            default: ""
        },

        description: {
            type: String,
            trim: true
        },

        verified: {
            type: Boolean,
            default: false
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
// COURSE SCHEMA
// ======================================================

const courseSchema = new mongoose.Schema(
    {
        university: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "University",
            required: true
        },

        courseName: {
            type: String,
            required: true,
            trim: true
        },

        duration: {
            type: String,
            trim: true
        },

        annualFees: {
            type: Number
        },

        minimumGrade: {
            type: String,
            trim: true
        },

        department: {
            type: String,
            trim: true
        },

        mode: {
            type: String,
            enum: [
                "Full Time",
                "Part Time",
                "Online"
            ]
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
// EXPORT ALL MODELS
// ======================================================

module.exports = {
    User,
    UniversityAdmin,
    Profile,
    University,
    Kcse,
    Course
};