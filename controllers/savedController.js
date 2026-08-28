const {
    SavedCourse,
    Course,
    SavedUniversity
} = require("../models/universityModel");


// ======================================================
// 1. SAVE COURSE
// ======================================================

const saveCourse = async (req, res) => {
    try {
        const studentId = req.user.id;
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
        // Find student's saved document
        // ------------------------------------------

        let saved = await Saved.findOne({
            student: studentId
        });

        // ------------------------------------------
        // Create if it doesn't exist
        // ------------------------------------------

        if (!saved) {
            saved = await Saved.create({
                student: studentId,
                courses: [courseId],
                universities: []
            });

            return res.status(201).json({
                success: true,
                message: "Course saved successfully",
                saved
            });
        }

        // ------------------------------------------
        // Check if already saved
        // ------------------------------------------

        if (saved.courses.includes(courseId)) {
            return res.status(409).json({
                success: false,
                message: "Course is already saved"
            });
        }

        // ------------------------------------------
        // Save course
        // ------------------------------------------

        saved.courses.push(courseId);

        await saved.save();

        return res.status(200).json({
            success: true,
            message: "Course saved successfully"
        });

    } catch (error) {
        console.error("Save course error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while saving course",
            error: error.message
        });
    }
};


// ======================================================
// 2. UNSAVE COURSE
// ======================================================

const unsaveCourse = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { courseId } = req.params;

        // ------------------------------------------
        // Find saved document
        // ------------------------------------------

        const saved = await Saved.findOne({
            student: studentId
        });

        if (!saved) {
            return res.status(404).json({
                success: false,
                message: "No saved courses found"
            });
        }

        // ------------------------------------------
        // Check course
        // ------------------------------------------

        const courseExists = saved.courses.some(
            id => id.toString() === courseId
        );

        if (!courseExists) {
            return res.status(404).json({
                success: false,
                message: "Course is not saved"
            });
        }

        // ------------------------------------------
        // Remove course
        // ------------------------------------------

        saved.courses = saved.courses.filter(
            id => id.toString() !== courseId
        );

        await saved.save();

        return res.status(200).json({
            success: true,
            message: "Course removed from saved courses"
        });

    } catch (error) {
        console.error("Unsave course error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Server error while removing saved course",
            error: error.message
        });
    }
};


// ======================================================
// 3. GET SAVED COURSES
// ======================================================

const getSavedCourses = async (req, res) => {
    try {
        const studentId = req.user.id;

        const saved = await Saved.findOne({
            student: studentId
        })
            .populate(
                "courses",
                "courseName duration annualFees minimumGrade department mode university"
            );

        // ------------------------------------------
        // No saved courses
        // ------------------------------------------

        if (!saved) {
            return res.status(200).json({
                success: true,
                count: 0,
                courses: []
            });
        }

        return res.status(200).json({
            success: true,
            count: saved.courses.length,
            courses: saved.courses
        });

    } catch (error) {
        console.error("Get saved courses error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Server error while getting saved courses",
            error: error.message
        });
    }
};


// ======================================================
// 4. SAVE UNIVERSITY
// ======================================================

const saveUniversity = async (req, res) => {
    try {
        const studentId = req.user.id;
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
        // Find saved document
        // ------------------------------------------

        let saved = await Saved.findOne({
            student: studentId
        });

        // ------------------------------------------
        // Create if it doesn't exist
        // ------------------------------------------

        if (!saved) {
            saved = await Saved.create({
                student: studentId,
                courses: [],
                universities: [universityId]
            });

            return res.status(201).json({
                success: true,
                message: "University saved successfully",
                saved
            });
        }

        // ------------------------------------------
        // Check duplicate
        // ------------------------------------------

        if (saved.universities.includes(universityId)) {
            return res.status(409).json({
                success: false,
                message: "University is already saved"
            });
        }

        // ------------------------------------------
        // Save university
        // ------------------------------------------

        saved.universities.push(universityId);

        await saved.save();

        return res.status(200).json({
            success: true,
            message: "University saved successfully"
        });

    } catch (error) {
        console.error("Save university error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Server error while saving university",
            error: error.message
        });
    }
};


// ======================================================
// 5. UNSAVE UNIVERSITY
// ======================================================

const unsaveUniversity = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { universityId } = req.params;

        // ------------------------------------------
        // Find saved document
        // ------------------------------------------

        const saved = await Saved.findOne({
            student: studentId
        });

        if (!saved) {
            return res.status(404).json({
                success: false,
                message: "No saved universities found"
            });
        }

        // ------------------------------------------
        // Check university
        // ------------------------------------------

        const universityExists =
            saved.universities.some(
                id => id.toString() === universityId
            );

        if (!universityExists) {
            return res.status(404).json({
                success: false,
                message: "University is not saved"
            });
        }

        // ------------------------------------------
        // Remove university
        // ------------------------------------------

        saved.universities =
            saved.universities.filter(
                id => id.toString() !== universityId
            );

        await saved.save();

        return res.status(200).json({
            success: true,
            message:
                "University removed from saved universities"
        });

    } catch (error) {
        console.error(
            "Unsave university error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while removing saved university",
            error: error.message
        });
    }
};


// ======================================================
// 6. GET SAVED UNIVERSITIES
// ======================================================

const getSavedUniversities = async (req, res) => {
    try {
        const studentId = req.user.id;

        const saved = await Saved.findOne({
            student: studentId
        })
            .populate(
                "universities",
                "name location county website email phone logo description"
            );

        // ------------------------------------------
        // No saved universities
        // ------------------------------------------

        if (!saved) {
            return res.status(200).json({
                success: true,
                count: 0,
                universities: []
            });
        }

        return res.status(200).json({
            success: true,
            count: saved.universities.length,
            universities: saved.universities
        });

    } catch (error) {
        console.error(
            "Get saved universities error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while getting saved universities",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    saveCourse,
    unsaveCourse,
    getSavedCourses,
    saveUniversity,
    unsaveUniversity,
    getSavedUniversities
};