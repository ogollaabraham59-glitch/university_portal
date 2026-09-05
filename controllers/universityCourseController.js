const mongoose = require("mongoose");

const {
    UniversityCourse,
    Course,
    University
} = require("../models/universityModel");


// ======================================================
// 1. ADD COURSE TO UNIVERSITY
// ======================================================

const addCourseToUniversity = async (req, res) => {
    try {
        const {
            university,
            course,
            campus,
            annualFees,
            applicationFee,
            mode,
            intake,
            applicationLink,
            isAvailable
        } = req.body;


        // ------------------------------------------
        // Validate IDs
        // ------------------------------------------

        if (!university || !course) {
            return res.status(400).json({
                success: false,
                message: "University and course are required"
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(university) ||
            !mongoose.Types.ObjectId.isValid(course)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid university or course ID"
            });
        }


        // ------------------------------------------
        // Check university
        // ------------------------------------------

        const universityExists = await University.findById(university);

        if (!universityExists) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        if (!universityExists.isActive) {
            return res.status(400).json({
                success: false,
                message: "This university is inactive"
            });
        }


        // ------------------------------------------
        // Check course
        // ------------------------------------------

        const courseExists = await Course.findById(course);

        if (!courseExists) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        if (!courseExists.isActive) {
            return res.status(400).json({
                success: false,
                message: "This course is inactive"
            });
        }


        // ------------------------------------------
        // Prevent duplicate
        // ------------------------------------------

        const existingUniversityCourse =
            await UniversityCourse.findOne({
                university,
                course
            });

        if (existingUniversityCourse) {
            return res.status(409).json({
                success: false,
                message:
                    "This course is already offered by this university"
            });
        }


        // ------------------------------------------
        // Validate intake
        // ------------------------------------------

        if (
            intake !== undefined &&
            !Array.isArray(intake)
        ) {
            return res.status(400).json({
                success: false,
                message: "Intake must be an array"
            });
        }


        // ------------------------------------------
        // Validate mode
        // ------------------------------------------

        const allowedModes = [
            "Full Time",
            "Part Time",
            "Online"
        ];

        if (
            mode !== undefined &&
            !allowedModes.includes(mode)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Mode must be Full Time, Part Time, or Online"
            });
        }


        // ------------------------------------------
        // Validate fees
        // ------------------------------------------

        if (
            annualFees !== undefined &&
            Number(annualFees) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Annual fees cannot be negative"
            });
        }

        if (
            applicationFee !== undefined &&
            Number(applicationFee) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Application fee cannot be negative"
            });
        }


        // ------------------------------------------
        // Create UniversityCourse
        // ------------------------------------------

        const universityCourse =
            await UniversityCourse.create({
                university,
                course,
                campus: campus || "",
                annualFees:
                    annualFees !== undefined
                        ? Number(annualFees)
                        : 0,

                applicationFee:
                    applicationFee !== undefined
                        ? Number(applicationFee)
                        : 0,

                mode: mode || "Full Time",

                intake: intake || [],

                applicationLink:
                    applicationLink || "",

                isAvailable:
                    isAvailable !== undefined
                        ? isAvailable
                        : true
            });


        // ------------------------------------------
        // Populate
        // ------------------------------------------

        const populatedUniversityCourse =
            await UniversityCourse.findById(
                universityCourse._id
            )
                .populate(
                    "university",
                    "name location county country logo website"
                )
                .populate(
                    "course",
                    "courseName courseCode description duration minimumGrade department mode"
                );


        return res.status(201).json({
            success: true,
            message:
                "Course added to university successfully",
            universityCourse:
                populatedUniversityCourse
        });


    } catch (error) {

        console.error(
            "Add course to university error:",
            error
        );

        // Handle duplicate compound index
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "This course is already offered by this university"
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Server error while adding course to university",
            error: error.message
        });
    }
};


// ======================================================
// 2. GET COURSES OFFERED BY A UNIVERSITY
// ======================================================

const getUniversityCourses = async (req, res) => {
    try {

        const { universityId } = req.params;


        // ------------------------------------------
        // Validate ID
        // ------------------------------------------

        if (!mongoose.Types.ObjectId.isValid(universityId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid university ID"
            });
        }


        // ------------------------------------------
        // Check university
        // ------------------------------------------

        const university =
            await University.findById(universityId);

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }


        // ------------------------------------------
        // Get courses
        // ------------------------------------------

        const universityCourses =
            await UniversityCourse.find({
                university: universityId,
                isAvailable: true
            })
                .populate(
                    "course",
                    "courseName courseCode description duration minimumGrade department mode"
                )
                .populate(
                    "university",
                    "name location county country logo website"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({
            success: true,
            count: universityCourses.length,
            universityCourses
        });


    } catch (error) {

        console.error(
            "Get university courses error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while getting university courses",
            error: error.message
        });
    }
};


// ======================================================
// 3. GET UNIVERSITIES OFFERING A COURSE
// ======================================================

const getCourseUniversities = async (req, res) => {
    try {

        const { courseId } = req.params;


        // ------------------------------------------
        // Validate ID
        // ------------------------------------------

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }


        // ------------------------------------------
        // Check course
        // ------------------------------------------

        const course =
            await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }


        // ------------------------------------------
        // Find universities
        // ------------------------------------------

        const universityCourses =
            await UniversityCourse.find({
                course: courseId,
                isAvailable: true
            })
                .populate(
                    "university",
                    "name location county country logo website"
                )
                .populate(
                    "course",
                    "courseName courseCode description duration minimumGrade department mode"
                );


        return res.status(200).json({
            success: true,
            count: universityCourses.length,
            universityCourses
        });


    } catch (error) {

        console.error(
            "Get course universities error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while getting universities offering course",
            error: error.message
        });
    }
};


// ======================================================
// 4. GET UNIVERSITY COURSE BY ID
// ======================================================

const getUniversityCourseById = async (req, res) => {
    try {

        const { id } = req.params;


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid university course ID"
            });
        }


        const universityCourse =
            await UniversityCourse.findById(id)
                .populate(
                    "university",
                    "name location county country logo website email phone"
                )
                .populate(
                    "course",
                    "courseName courseCode description duration minimumGrade department mode"
                );


        if (!universityCourse) {
            return res.status(404).json({
                success: false,
                message: "University course not found"
            });
        }


        return res.status(200).json({
            success: true,
            universityCourse
        });


    } catch (error) {

        console.error(
            "Get university course error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while getting university course",
            error: error.message
        });
    }
};


// ======================================================
// 5. UPDATE UNIVERSITY COURSE
// ======================================================

const updateUniversityCourse = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            campus,
            annualFees,
            applicationFee,
            mode,
            intake,
            applicationLink,
            isAvailable
        } = req.body;


        // ------------------------------------------
        // Validate ID
        // ------------------------------------------

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid university course ID"
            });
        }


        // ------------------------------------------
        // Find university course
        // ------------------------------------------

        const universityCourse =
            await UniversityCourse.findById(id);

        if (!universityCourse) {
            return res.status(404).json({
                success: false,
                message: "University course not found"
            });
        }


        // ------------------------------------------
        // Campus
        // ------------------------------------------

        if (campus !== undefined) {
            universityCourse.campus = campus;
        }


        // ------------------------------------------
        // Annual fees
        // ------------------------------------------

        if (annualFees !== undefined) {

            if (Number(annualFees) < 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Annual fees cannot be negative"
                });
            }

            universityCourse.annualFees =
                Number(annualFees);
        }


        // ------------------------------------------
        // Application fee
        // ------------------------------------------

        if (applicationFee !== undefined) {

            if (Number(applicationFee) < 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Application fee cannot be negative"
                });
            }

            universityCourse.applicationFee =
                Number(applicationFee);
        }


        // ------------------------------------------
        // Mode
        // ------------------------------------------

        if (mode !== undefined) {

            const allowedModes = [
                "Full Time",
                "Part Time",
                "Online"
            ];

            if (!allowedModes.includes(mode)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Mode must be Full Time, Part Time, or Online"
                });
            }

            universityCourse.mode = mode;
        }


        // ------------------------------------------
        // Intake
        // ------------------------------------------

        if (intake !== undefined) {

            if (!Array.isArray(intake)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Intake must be an array"
                });
            }

            universityCourse.intake = intake;
        }


        // ------------------------------------------
        // Application link
        // ------------------------------------------

        if (applicationLink !== undefined) {
            universityCourse.applicationLink =
                applicationLink.trim();
        }


        // ------------------------------------------
        // Availability
        // ------------------------------------------

        if (isAvailable !== undefined) {

            if (typeof isAvailable !== "boolean") {
                return res.status(400).json({
                    success: false,
                    message:
                        "isAvailable must be true or false"
                });
            }

            universityCourse.isAvailable =
                isAvailable;
        }


        await universityCourse.save();


        // ------------------------------------------
        // Populate updated record
        // ------------------------------------------

        const updatedUniversityCourse =
            await UniversityCourse.findById(id)
                .populate(
                    "university",
                    "name location county country logo"
                )
                .populate(
                    "course",
                    "courseName courseCode description duration minimumGrade department mode"
                );


        return res.status(200).json({
            success: true,
            message:
                "University course updated successfully",
            universityCourse:
                updatedUniversityCourse
        });


    } catch (error) {

        console.error(
            "Update university course error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while updating university course",
            error: error.message
        });
    }
};


// ======================================================
// 6. REMOVE COURSE FROM UNIVERSITY
// ======================================================

const removeCourseFromUniversity = async (req, res) => {
    try {

        const { id } = req.params;


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid university course ID"
            });
        }


        const universityCourse =
            await UniversityCourse.findById(id);

        if (!universityCourse) {
            return res.status(404).json({
                success: false,
                message: "University course not found"
            });
        }


        await UniversityCourse.findByIdAndDelete(id);


        return res.status(200).json({
            success: true,
            message:
                "Course removed from university successfully"
        });


    } catch (error) {

        console.error(
            "Remove course from university error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while removing course from university",
            error: error.message
        });
    }
};


// ======================================================
// 7. UPDATE ANNUAL FEES
// ======================================================

const updateAnnualFees = async (req, res) => {
    try {

        const { id } = req.params;
        const { annualFees } = req.body;


        if (
            annualFees === undefined ||
            annualFees === null
        ) {
            return res.status(400).json({
                success: false,
                message: "Annual fees are required"
            });
        }


        if (Number(annualFees) < 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Annual fees cannot be negative"
            });
        }


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid university course ID"
            });
        }


        const universityCourse =
            await UniversityCourse.findById(id);

        if (!universityCourse) {
            return res.status(404).json({
                success: false,
                message:
                    "University course not found"
            });
        }


        universityCourse.annualFees =
            Number(annualFees);

        await universityCourse.save();


        return res.status(200).json({
            success: true,
            message:
                "Annual fees updated successfully",
            annualFees:
                universityCourse.annualFees
        });


    } catch (error) {

        console.error(
            "Update annual fees error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while updating annual fees",
            error: error.message
        });
    }
};


// ======================================================
// 8. UPDATE INTAKE
// ======================================================

const updateIntake = async (req, res) => {
    try {

        const { id } = req.params;
        const { intake } = req.body;


        if (!Array.isArray(intake)) {
            return res.status(400).json({
                success: false,
                message:
                    "Intake must be an array"
            });
        }


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid university course ID"
            });
        }


        const universityCourse =
            await UniversityCourse.findById(id);

        if (!universityCourse) {
            return res.status(404).json({
                success: false,
                message:
                    "University course not found"
            });
        }


        universityCourse.intake = intake;

        await universityCourse.save();


        return res.status(200).json({
            success: true,
            message:
                "Course intake updated successfully",
            intake:
                universityCourse.intake
        });


    } catch (error) {

        console.error(
            "Update intake error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while updating course intake",
            error: error.message
        });
    }
};


// ======================================================
// 9. UPDATE APPLICATION LINK
// ======================================================

const updateApplicationLink = async (req, res) => {
    try {

        const { id } = req.params;
        const { applicationLink } = req.body;


        if (!applicationLink) {
            return res.status(400).json({
                success: false,
                message:
                    "Application link is required"
            });
        }


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid university course ID"
            });
        }


        const universityCourse =
            await UniversityCourse.findById(id);

        if (!universityCourse) {
            return res.status(404).json({
                success: false,
                message:
                    "University course not found"
            });
        }


        universityCourse.applicationLink =
            applicationLink.trim();

        await universityCourse.save();


        return res.status(200).json({
            success: true,
            message:
                "Application link updated successfully",
            applicationLink:
                universityCourse.applicationLink
        });


    } catch (error) {

        console.error(
            "Update application link error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while updating application link",
            error: error.message
        });
    }
};


// ======================================================
// 10. UPDATE AVAILABILITY
// ======================================================

const updateAvailability = async (req, res) => {
    try {

        const { id } = req.params;
        const { isAvailable } = req.body;


        if (typeof isAvailable !== "boolean") {
            return res.status(400).json({
                success: false,
                message:
                    "isAvailable must be true or false"
            });
        }


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid university course ID"
            });
        }


        const universityCourse =
            await UniversityCourse.findById(id);

        if (!universityCourse) {
            return res.status(404).json({
                success: false,
                message:
                    "University course not found"
            });
        }


        universityCourse.isAvailable =
            isAvailable;

        await universityCourse.save();


        return res.status(200).json({
            success: true,
            message:
                "Course availability updated successfully",
            isAvailable:
                universityCourse.isAvailable
        });


    } catch (error) {

        console.error(
            "Update availability error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while updating course availability",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    addCourseToUniversity,
    getUniversityCourses,
    getCourseUniversities,
    getUniversityCourseById,
    updateUniversityCourse,
    removeCourseFromUniversity,
    updateAnnualFees,
    updateIntake,
    updateApplicationLink,
    updateAvailability
};