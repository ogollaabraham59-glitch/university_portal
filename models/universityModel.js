const mongoose = require("mongoose");
const Schema = mongoose.Schema

//user  schema

const userSchema = new mongoose.Schema({
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
        lowercase: true
    },

    phone: {
        type: String,
        required: true,
        unique: true
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
        enum: ["student", "university_admin", "super_admin"],
        default: "student"
    },

    university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "University",
        default: null
    },

    isVerified: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});
const User = mongoose.model("User", userSchema)

//student profile

const studentProfileSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    gender: String,

    dateOfBirth: Date,

    county: String,

    kcseYear: Number,

    meanGrade: String,

    interests: [String]

}, {
    timestamps: true
});
const profile = mongoose.model("profile", studentProfileSchema)
//upload result

const kcseResultSchema = new mongoose.Schema({

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
        enum: ["Pending", "Processed"],
        default: "Pending"
    },

    extractedSubjects: [
        {
            subject: String,
            grade: String
        }
    ]

}, {
    timestamps: true
});

const kcse = mongoose.model("kcse", kcseResultSchema)


//university schema

const universitySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    location: String,

    county: String,

    website: String,

    email: String,

    phone: String,

    logo: String,

    description: String,

    verified: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});
const university = mongoose.model("university", universitySchema)

//courses schema
const courseSchema = new mongoose.Schema({

    university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "University",
        required: true
    },

    courseName: String,

    duration: String,

    annualFees: Number,

    minimumGrade: String,

    department: String,

    mode: {
        type: String,
        enum: ["Full Time", "Part Time", "Online"]
    }

}, {
    timestamps: true
});
const course = mongoose.model("course", courseSchema)

module.exports = { User, profile, university, kcse, course }