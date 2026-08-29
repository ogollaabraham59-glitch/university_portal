const { Course, University, UniversityCourse } = require("../models/universityModel");


// ======================================================
// 1. CREATE COURSE
// ======================================================

const createCourse = async (req, res) => {
    try {
        const {
            university,
            courseName,
            courseCode,
            description,
            duration,
            department,
            category,
            minimumGrade,
            requirements,
            mode,

            // UniversityCourse information
            campus,
            annualFees,
            applicationFee,
            intake,
            applicationLink
        } = req.body;

        // ==========================================
        // VALIDATION
        // ==========================================

        if (!university || !courseName || !minimumGrade) {
            return res.status(400).json({
                success: false,
                message:
                    "University, course name and minimum grade are required"
            });
        }

        // ==========================================
        // CHECK UNIVERSITY
        // ==========================================

        const universityExists = await University.findById(university);

        if (!universityExists) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        // ==========================================
        // CHECK IF COURSE ALREADY EXISTS
        // ==========================================

        const existingCourse = await Course.findOne({
            courseName: courseName.trim()
        });

        // If course exists, use the existing course
        let course;

        if (existingCourse) {
            course = existingCourse;
        } else {

            // ==========================================
            // CREATE COURSE
            // ==========================================

            course = await Course.create({
                courseName: courseName.trim(),
                courseCode,
                description,
                duration,
                department,
                category,
                minimumGrade,
                requirements,
                mode
            });
        }

        // ==========================================
        // CHECK UNIVERSITY-COURSE RELATIONSHIP
        // ==========================================

        const existingUniversityCourse =
            await UniversityCourse.findOne({
                university,
                course: course._id
            });

        if (existingUniversityCourse) {
            return res.status(409).json({
                success: false,
                message:
                    "This course is already offered by this university"
            });
        }

        // ==========================================
        // CONNECT COURSE TO UNIVERSITY
        // ==========================================

        const universityCourse = await UniversityCourse.create({
            university,
            course: course._id,
            campus,
            annualFees,
            applicationFee,
            mode,
            intake,
            applicationLink
        });

        // ==========================================
        // GET COMPLETE RESULT
        // ==========================================

        const result = await UniversityCourse
            .findById(universityCourse._id)
            .populate(
                "university",
                "name location county country website logo"
            )
            .populate(
                "course"
            );

        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(201).json({
            success: true,
            message:
                "Course created and assigned to university successfully",
            course: result
        });

    } catch (error) {

        console.error("Create course error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating course",
            error: error.message
        });
    }
};


// ======================================================
// 2. GET ALL COURSES
// ======================================================

const getCourses = async (req, res) => {
    try {

        const courses = await Course.find()
            .populate(
                "university",
                "name location county website logo"
            )
            .sort({
                courseName: 1
            });

        return res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });

    } catch (error) {
        console.error("Get courses error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting courses",
            error: error.message
        });
    }
};


// ======================================================
// 3. GET COURSE BY ID
// ======================================================

const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id)
            .populate(
                "university",
                "name location county website email phone logo"
            );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        return res.status(200).json({
            success: true,
            course
        });

    } catch (error) {
        console.error("Get course by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting course",
            error: error.message
        });
    }
};


// ======================================================
// 4. UPDATE COURSE
// ======================================================

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            university,
            courseName,
            duration,
            annualFees,
            minimumGrade,
            department,
            mode
        } = req.body;

        // ------------------------------------------
        // Find existing course
        // ------------------------------------------

        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // ------------------------------------------
        // University change
        // ------------------------------------------

        if (
            university !== undefined &&
            university.toString() !==
            course.university.toString()
        ) {

            const universityExists =
                await University.findById(university);

            if (!universityExists) {
                return res.status(404).json({
                    success: false,
                    message: "University not found"
                });
            }

            course.university = university;
        }

        // ------------------------------------------
        // Course name
        // ------------------------------------------

        if (courseName !== undefined) {

            if (!courseName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Course name cannot be empty"
                });
            }

            course.courseName = courseName.trim();
        }

        // ------------------------------------------
        // Other fields
        // ------------------------------------------

        if (duration !== undefined) {
            course.duration = duration;
        }

        if (annualFees !== undefined) {
            course.annualFees = annualFees;
        }

        if (minimumGrade !== undefined) {
            course.minimumGrade = minimumGrade;
        }

        if (department !== undefined) {
            course.department = department;
        }

        if (mode !== undefined) {
            course.mode = mode;
        }

        // ------------------------------------------
        // Prevent duplicate course
        // ------------------------------------------

        const duplicateCourse = await Course.findOne({
            university: course.university,
            courseName: course.courseName,
            _id: { $ne: id }
        });

        if (duplicateCourse) {
            return res.status(409).json({
                success: false,
                message:
                    "This course already exists in this university"
            });
        }

        await course.save();

        // ------------------------------------------
        // Populate university
        // ------------------------------------------

        const updatedCourse = await Course.findById(id)
            .populate(
                "university",
                "name location county website logo"
            );

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course: updatedCourse
        });

    } catch (error) {
        console.error("Update course error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating course",
            error: error.message
        });
    }
};


// ======================================================
// 5. DELETE COURSE
// ======================================================

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        await Course.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });

    } catch (error) {
        console.error("Delete course error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting course",
            error: error.message
        });
    }
};


// ======================================================
// 6. GET COURSES BY UNIVERSITY
// ======================================================

const getCoursesByUniversity = async (req, res) => {
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

        const courses = await Course.find({
            university: universityId
        })
            .populate(
                "university",
                "name location county logo"
            )
            .sort({
                courseName: 1
            });

        return res.status(200).json({
            success: true,
            university: {
                id: university._id,
                name: university.name
            },
            count: courses.length,
            courses
        });

    } catch (error) {
        console.error(
            "Get courses by university error:",
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
// 7. SEARCH COURSES
// ======================================================

const searchCourses = async (req, res) => {
    try {
        const {
            search,
            university,
            department,
            mode,
            minimumGrade,
            minFees,
            maxFees
        } = req.query;

        // ------------------------------------------
        // Build filter
        // ------------------------------------------

        const filter = {};

        // ------------------------------------------
        // General search
        // ------------------------------------------

        if (search) {
            filter.$or = [
                {
                    courseName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    department: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        // ------------------------------------------
        // University filter
        // ------------------------------------------

        if (university) {
            filter.university = university;
        }

        // ------------------------------------------
        // Department
        // ------------------------------------------

        if (department) {
            filter.department = {
                $regex: department,
                $options: "i"
            };
        }

        // ------------------------------------------
        // Mode
        // ------------------------------------------

        if (mode) {
            filter.mode = mode;
        }

        // ------------------------------------------
        // Minimum grade
        // ------------------------------------------

        if (minimumGrade) {
            filter.minimumGrade = {
                $regex: minimumGrade,
                $options: "i"
            };
        }

        // ------------------------------------------
        // Fees
        // ------------------------------------------

        if (minFees !== undefined || maxFees !== undefined) {

            filter.annualFees = {};

            if (minFees !== undefined) {
                filter.annualFees.$gte = Number(minFees);
            }

            if (maxFees !== undefined) {
                filter.annualFees.$lte = Number(maxFees);
            }
        }

        // ------------------------------------------
        // Search database
        // ------------------------------------------

        const courses = await Course.find(filter)
            .populate(
                "university",
                "name location county logo"
            )
            .sort({
                courseName: 1
            });

        return res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });

    } catch (error) {
        console.error("Search courses error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while searching courses",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getCoursesByUniversity,
    searchCourses
};