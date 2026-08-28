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
            fees,
            intakes,
            applicationLink,
            availability
        } = req.body;

        // ------------------------------------------
        // Validate required fields
        // ------------------------------------------

        if (!university || !course) {
            return res.status(400).json({
                success: false,
                message: "University and course are required"
            });
        }

        // ------------------------------------------
        // Check university
        // ------------------------------------------

        const universityExists = await University.findById(
            university
        );

        if (!universityExists) {
            return res.status(404).json({
                success: false,
                message: "University not found"
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
        // Create UniversityCourse
        // ------------------------------------------

        const universityCourse = await UniversityCourse.create({
            university,
            course,
            fees,
            intakes: intakes || [],
            applicationLink: applicationLink || "",
            availability:
                availability !== undefined
                    ? availability
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
                    "name location county logo"
                )
                .populate(
                    "course",
                    "courseName duration minimumGrade department mode"
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
        // Check university
        // ------------------------------------------

        const university = await University.findById(
            universityId
        );

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
                university: universityId
            })
                .populate(
                    "course",
                    "courseName duration minimumGrade department mode"
                )
                .populate(
                    "university",
                    "name location county logo"
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
        // Check course
        // ------------------------------------------

        const course = await Course.findById(courseId);

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
                course: courseId
            })
                .populate(
                    "university",
                    "name location county country logo website"
                )
                .populate(
                    "course",
                    "courseName duration minimumGrade department mode"
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

        const universityCourse =
            await UniversityCourse.findById(id)
                .populate(
                    "university",
                    "name location county country logo website email phone"
                )
                .populate(
                    "course",
                    "courseName duration minimumGrade department mode"
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
            fees,
            intakes,
            applicationLink,
            availability
        } = req.body;

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
        // Fees
        // ------------------------------------------

        if (fees !== undefined) {
            universityCourse.fees = fees;
        }

        // ------------------------------------------
        // Intakes
        // ------------------------------------------

        if (intakes !== undefined) {

            if (!Array.isArray(intakes)) {
                return res.status(400).json({
                    success: false,
                    message: "Intakes must be an array"
                });
            }

            universityCourse.intakes = intakes;
        }

        // ------------------------------------------
        // Application link
        // ------------------------------------------

        if (applicationLink !== undefined) {
            universityCourse.applicationLink =
                applicationLink;
        }

        // ------------------------------------------
        // Availability
        // ------------------------------------------

        if (availability !== undefined) {
            universityCourse.availability =
                availability;
        }

        await universityCourse.save();

        const updatedUniversityCourse =
            await UniversityCourse.findById(id)
                .populate(
                    "university",
                    "name location county logo"
                )
                .populate(
                    "course",
                    "courseName duration minimumGrade department mode"
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
// 7. UPDATE FEES
// ======================================================

const updateFees = async (req, res) => {
    try {
        const { id } = req.params;
        const { fees } = req.body;

        // ------------------------------------------
        // Validate
        // ------------------------------------------

        if (fees === undefined || fees === null) {
            return res.status(400).json({
                success: false,
                message: "Fees are required"
            });
        }

        if (Number(fees) < 0) {
            return res.status(400).json({
                success: false,
                message: "Fees cannot be negative"
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

        universityCourse.fees = Number(fees);

        await universityCourse.save();

        return res.status(200).json({
            success: true,
            message: "Course fees updated successfully",
            fees: universityCourse.fees
        });

    } catch (error) {
        console.error("Update fees error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Server error while updating course fees",
            error: error.message
        });
    }
};


// ======================================================
// 8. UPDATE INTAKES
// ======================================================

const updateIntakes = async (req, res) => {
    try {
        const { id } = req.params;
        const { intakes } = req.body;

        // ------------------------------------------
        // Validate
        // ------------------------------------------

        if (!Array.isArray(intakes)) {
            return res.status(400).json({
                success: false,
                message: "Intakes must be an array"
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

        universityCourse.intakes = intakes;

        await universityCourse.save();

        return res.status(200).json({
            success: true,
            message: "Course intakes updated successfully",
            intakes: universityCourse.intakes
        });

    } catch (error) {
        console.error("Update intakes error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Server error while updating course intakes",
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

        // ------------------------------------------
        // Validate
        // ------------------------------------------

        if (!applicationLink) {
            return res.status(400).json({
                success: false,
                message: "Application link is required"
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
        const { availability } = req.body;

        // ------------------------------------------
        // Validate
        // ------------------------------------------

        if (typeof availability !== "boolean") {
            return res.status(400).json({
                success: false,
                message:
                    "Availability must be true or false"
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

        universityCourse.availability =
            availability;

        await universityCourse.save();

        return res.status(200).json({
            success: true,
            message:
                "Course availability updated successfully",
            availability:
                universityCourse.availability
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
    updateFees,
    updateIntakes,
    updateApplicationLink,
    updateAvailability
};