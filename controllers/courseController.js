const {
    Course,
    University,
    UniversityCourse
} = require("../models/universityModel");


// ======================================================
// HELPER: GET COURSE WITH UNIVERSITY OFFERINGS
// ======================================================

const getCourseWithOfferings = async (courseId) => {
    const course = await Course.findById(courseId)
        .populate("category", "name description");

    if (!course) {
        return null;
    }

    const offerings = await UniversityCourse.find({
        course: courseId,
        isAvailable: true
    })
        .populate(
            "university",
            "name location county country website email phone logo"
        )
        .sort({ annualFees: 1 });

    return {
        ...course.toObject(),
        universities: offerings
    };
};


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

        const universityExists =
            await University.findById(university);

        if (!universityExists) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }


        // ==========================================
        // CHECK IF COURSE ALREADY EXISTS
        // ==========================================

        let course = await Course.findOne({
            courseName: courseName.trim()
        });


        // ==========================================
        // CREATE COURSE IF IT DOES NOT EXIST
        // ==========================================

        if (!course) {

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

        } else {

            // Optional: update general course information
            // when the course already exists.

            if (courseCode !== undefined) {
                course.courseCode = courseCode;
            }

            if (description !== undefined) {
                course.description = description;
            }

            if (duration !== undefined) {
                course.duration = duration;
            }

            if (department !== undefined) {
                course.department = department;
            }

            if (category !== undefined) {
                course.category = category;
            }

            if (minimumGrade !== undefined) {
                course.minimumGrade = minimumGrade;
            }

            if (requirements !== undefined) {
                course.requirements = requirements;
            }

            if (mode !== undefined) {
                course.mode = mode;
            }

            await course.save();
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
        // CREATE UNIVERSITY-COURSE RELATIONSHIP
        // ==========================================

        const universityCourse =
            await UniversityCourse.create({
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

        const result =
            await UniversityCourse.findById(
                universityCourse._id
            )
                .populate(
                    "university",
                    "name location county country website email phone logo"
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

        console.error(
            "Create course error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while creating course",
            error: error.message
        });
    }
};


// ======================================================
// 2. GET ALL COURSES
// ======================================================

const getCourses = async (req, res) => {
    try {

        // Get all courses
        const courses = await Course.find()
            .populate(
                "category",
                "name description"
            )
            .sort({
                courseName: 1
            });


        // Get university offerings
        const courseIds = courses.map(
            course => course._id
        );

        const offerings =
            await UniversityCourse.find({
                course: { $in: courseIds }
            })
                .populate(
                    "university",
                    "name location county country website logo"
                )
                .sort({
                    annualFees: 1
                });


        // Attach universities to each course
        const coursesWithUniversities =
            courses.map(course => {

                const universityOfferings =
                    offerings.filter(
                        offering =>
                            offering.course.toString() ===
                            course._id.toString()
                    );

                return {
                    ...course.toObject(),
                    universities:
                        universityOfferings
                };
            });


        return res.status(200).json({
            success: true,
            count: coursesWithUniversities.length,
            courses: coursesWithUniversities
        });

    } catch (error) {

        console.error(
            "Get courses error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while getting courses",
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


        // ==========================================
        // GET COURSE
        // ==========================================

        const course = await Course.findById(id)
            .populate(
                "category",
                "name description"
            );


        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }


        // ==========================================
        // GET UNIVERSITIES OFFERING COURSE
        // ==========================================

        const universityCourses =
            await UniversityCourse.find({
                course: id
            })
                .populate(
                    "university",
                    "name location county country website email phone logo"
                )
                .sort({
                    annualFees: 1
                });


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,

            course: {
                ...course.toObject(),

                universities:
                    universityCourses
            }
        });

    } catch (error) {

        console.error(
            "Get course by ID error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while getting course",
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
            courseName,
            courseCode,
            description,
            duration,
            department,
            category,
            minimumGrade,
            requirements,
            mode
        } = req.body;


        // ==========================================
        // FIND COURSE
        // ==========================================

        const course =
            await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }


        // ==========================================
        // UPDATE COURSE INFORMATION
        // ==========================================

        if (courseName !== undefined) {

            if (!courseName.trim()) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Course name cannot be empty"
                });
            }

            course.courseName =
                courseName.trim();
        }


        if (courseCode !== undefined) {
            course.courseCode =
                courseCode;
        }


        if (description !== undefined) {
            course.description =
                description;
        }


        if (duration !== undefined) {
            course.duration =
                duration;
        }


        if (department !== undefined) {
            course.department =
                department;
        }


        if (category !== undefined) {
            course.category =
                category;
        }


        if (minimumGrade !== undefined) {
            course.minimumGrade =
                minimumGrade;
        }


        if (requirements !== undefined) {
            course.requirements =
                requirements;
        }


        if (mode !== undefined) {
            course.mode =
                mode;
        }


        // ==========================================
        // CHECK DUPLICATE COURSE NAME
        // ==========================================

        if (courseName !== undefined) {

            const duplicateCourse =
                await Course.findOne({
                    courseName:
                        course.courseName,
                    _id: { $ne: id }
                });

            if (duplicateCourse) {
                return res.status(409).json({
                    success: false,
                    message:
                        "A course with this name already exists"
                });
            }
        }


        // ==========================================
        // SAVE
        // ==========================================

        await course.save();


        // ==========================================
        // GET UPDATED COURSE
        // ==========================================

        const updatedCourse =
            await Course.findById(id)
                .populate(
                    "category",
                    "name description"
                );


        // ==========================================
        // GET UNIVERSITY OFFERINGS
        // ==========================================

        const universityCourses =
            await UniversityCourse.find({
                course: id
            })
                .populate(
                    "university",
                    "name location county country website email phone logo"
                );


        return res.status(200).json({
            success: true,
            message:
                "Course updated successfully",

            course: {
                ...updatedCourse.toObject(),

                universities:
                    universityCourses
            }
        });

    } catch (error) {

        console.error(
            "Update course error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while updating course",
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


        // ==========================================
        // FIND COURSE
        // ==========================================

        const course =
            await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message:
                    "Course not found"
            });
        }


        // ==========================================
        // DELETE UNIVERSITY RELATIONSHIPS
        // ==========================================

        await UniversityCourse.deleteMany({
            course: id
        });


        // ==========================================
        // DELETE COURSE
        // ==========================================

        await Course.findByIdAndDelete(id);


        return res.status(200).json({
            success: true,
            message:
                "Course and all university relationships deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete course error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while deleting course",
            error: error.message
        });
    }
};


// ======================================================
// 6. GET COURSES BY UNIVERSITY
// ======================================================

const getCoursesByUniversity = async (req, res) => {
    try {

        const { universityId } =
            req.params;


        // ==========================================
        // CHECK UNIVERSITY
        // ==========================================

        const university =
            await University.findById(
                universityId
            );

        if (!university) {
            return res.status(404).json({
                success: false,
                message:
                    "University not found"
            });
        }


        // ==========================================
        // GET UNIVERSITY-COURSE RELATIONSHIPS
        // ==========================================

        const universityCourses =
            await UniversityCourse.find({
                university: universityId
            })
                .populate(
                    "course"
                )
                .populate(
                    "university",
                    "name location county country website logo"
                )
                .sort({
                    "course.courseName": 1
                });


        return res.status(200).json({
            success: true,

            university: {
                id: university._id,
                name: university.name,
                location: university.location,
                county: university.county,
                country: university.country,
                website: university.website,
                logo: university.logo
            },

            count:
                universityCourses.length,

            courses:
                universityCourses
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


        // ==========================================
        // COURSE FILTER
        // ==========================================

        const courseFilter = {};


        // ==========================================
        // GENERAL SEARCH
        // ==========================================

        if (search) {

            courseFilter.$or = [

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


        // ==========================================
        // DEPARTMENT
        // ==========================================

        if (department) {

            courseFilter.department = {
                $regex: department,
                $options: "i"
            };
        }


        // ==========================================
        // MINIMUM GRADE
        // ==========================================

        if (minimumGrade) {

            courseFilter.minimumGrade = {
                $regex: minimumGrade,
                $options: "i"
            };
        }


        // ==========================================
        // FIND COURSES
        // ==========================================

        const courses =
            await Course.find(courseFilter)
                .populate(
                    "category",
                    "name description"
                )
                .sort({
                    courseName: 1
                });


        // ==========================================
        // COURSE IDS
        // ==========================================

        const courseIds =
            courses.map(
                course => course._id
            );


        // ==========================================
        // UNIVERSITY COURSE FILTER
        // ==========================================

        const universityCourseFilter = {
            course: {
                $in: courseIds
            }
        };


        // ==========================================
        // UNIVERSITY FILTER
        // ==========================================

        if (university) {

            universityCourseFilter.university =
                university;
        }


        // ==========================================
        // MODE FILTER
        // ==========================================

        if (mode) {

            universityCourseFilter.mode =
                mode;
        }


        // ==========================================
        // FEES FILTER
        // ==========================================

        if (
            minFees !== undefined ||
            maxFees !== undefined
        ) {

            universityCourseFilter.annualFees = {};

            if (minFees !== undefined) {

                universityCourseFilter
                    .annualFees
                    .$gte =
                    Number(minFees);
            }


            if (maxFees !== undefined) {

                universityCourseFilter
                    .annualFees
                    .$lte =
                    Number(maxFees);
            }
        }


        // ==========================================
        // GET UNIVERSITY OFFERINGS
        // ==========================================

        const offerings =
            await UniversityCourse.find(
                universityCourseFilter
            )
                .populate(
                    "university",
                    "name location county country website logo"
                )
                .populate(
                    "course"
                )
                .sort({
                    annualFees: 1
                });


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,
            count: offerings.length,
            courses: offerings
        });

    } catch (error) {

        console.error(
            "Search courses error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while searching courses",
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