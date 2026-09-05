const mongoose = require("mongoose");

const {
    Course,
    University,
    UniversityCourse
} = require("../models/universityModel");


// ======================================================
// HELPER: CHECK VALID MONGODB ID
// ======================================================

const isValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};


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
        .sort({
            annualFees: 1
        });

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
        // VALIDATE UNIVERSITY ID
        // ==========================================

        if (!isValidId(university)) {
            return res.status(400).json({
                success: false,
                message: "Invalid university ID"
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


        if (!universityExists.isActive) {
            return res.status(400).json({
                success: false,
                message: "This university is inactive"
            });
        }


        // ==========================================
        // VALIDATE FEES
        // ==========================================

        if (
            annualFees !== undefined &&
            annualFees !== null &&
            (
                Number.isNaN(Number(annualFees)) ||
                Number(annualFees) < 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Annual fees must be a valid positive number"
            });
        }


        if (
            applicationFee !== undefined &&
            applicationFee !== null &&
            (
                Number.isNaN(Number(applicationFee)) ||
                Number(applicationFee) < 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Application fee must be a valid positive number"
            });
        }


        // ==========================================
        // CHECK IF COURSE ALREADY EXISTS
        // ==========================================

        let course = await Course.findOne({
            courseName: courseName.trim()
        });


        // ==========================================
        // CREATE COURSE
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

            // ==========================================
            // UPDATE GENERAL COURSE INFORMATION
            // ==========================================

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
        // CHECK UNIVERSITY + COURSE RELATIONSHIP
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
        // CREATE UNIVERSITY COURSE
        // ==========================================

        const universityCourse =
            await UniversityCourse.create({
                university,
                course: course._id,
                campus,
                annualFees:
                    annualFees !== undefined
                        ? Number(annualFees)
                        : undefined,
                applicationFee:
                    applicationFee !== undefined
                        ? Number(applicationFee)
                        : undefined,
                mode,
                intake,
                applicationLink,
                isAvailable: true
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
                    "course",
                    "courseName courseCode description duration department category minimumGrade requirements mode"
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

        // ==========================================
        // GET ACTIVE COURSES
        // ==========================================

        const courses = await Course.find({
            isActive: true
        })
            .populate(
                "category",
                "name description"
            )
            .sort({
                courseName: 1
            });


        // ==========================================
        // GET COURSE IDS
        // ==========================================

        const courseIds = courses.map(
            course => course._id
        );


        // ==========================================
        // GET ACTIVE UNIVERSITY OFFERINGS
        // ==========================================

        const offerings =
            await UniversityCourse.find({
                course: {
                    $in: courseIds
                },
                isAvailable: true
            })
                .populate(
                    "university",
                    "name location county country website logo"
                )
                .sort({
                    annualFees: 1
                });


        // ==========================================
        // ATTACH UNIVERSITIES TO COURSES
        // ==========================================

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


        // ==========================================
        // RESPONSE
        // ==========================================

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
        // VALIDATE ID
        // ==========================================

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }


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
        // GET ACTIVE UNIVERSITY OFFERINGS
        // ==========================================

        const universityCourses =
            await UniversityCourse.find({
                course: id,
                isAvailable: true
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

        // ==========================================
        // VALIDATE ID
        // ==========================================

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }


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
        // COURSE NAME
        // ==========================================

        if (courseName !== undefined) {

            if (
                typeof courseName !== "string" ||
                !courseName.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Course name cannot be empty"
                });
            }


            const duplicateCourse =
                await Course.findOne({
                    courseName: courseName.trim(),
                    _id: {
                        $ne: id
                    }
                });

            if (duplicateCourse) {
                return res.status(409).json({
                    success: false,
                    message:
                        "A course with this name already exists"
                });
            }


            course.courseName =
                courseName.trim();
        }


        // ==========================================
        // UPDATE OPTIONAL FIELDS
        // ==========================================

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

            if (
                typeof minimumGrade !== "string" ||
                !minimumGrade.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Minimum grade cannot be empty"
                });
            }

            course.minimumGrade =
                minimumGrade.trim();
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
        // SAVE COURSE
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
                )
                .sort({
                    annualFees: 1
                });


        // ==========================================
        // RESPONSE
        // ==========================================

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
        // VALIDATE ID
        // ==========================================

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }


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


        // ==========================================
        // SUCCESS
        // ==========================================

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
        // VALIDATE ID
        // ==========================================

        if (!isValidId(universityId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid university ID"
            });
        }


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
        // GET UNIVERSITY COURSES
        // ==========================================

        const universityCourses =
            await UniversityCourse.find({
                university: universityId,
                isAvailable: true
            })
                .populate(
                    "course"
                )
                .populate(
                    "university",
                    "name location county country website logo"
                );


        // ==========================================
        // SORT AFTER POPULATION
        // ==========================================

        universityCourses.sort((a, b) => {

            const courseA =
                a.course?.courseName || "";

            const courseB =
                b.course?.courseName || "";

            return courseA.localeCompare(courseB);
        });


        // ==========================================
        // RESPONSE
        // ==========================================

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

        const courseFilter = {
            isActive: true
        };


        // ==========================================
        // GENERAL SEARCH
        // ==========================================

        if (search) {

            const escapedSearch =
                search.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

            courseFilter.$or = [

                {
                    courseName: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                },

                {
                    department: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                }

            ];
        }


        // ==========================================
        // DEPARTMENT
        // ==========================================

        if (department) {

            const escapedDepartment =
                department.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

            courseFilter.department = {
                $regex: escapedDepartment,
                $options: "i"
            };
        }


        // ==========================================
        // MINIMUM GRADE SEARCH
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
            },

            isAvailable: true
        };


        // ==========================================
        // UNIVERSITY FILTER
        // ==========================================

        if (university) {

            if (!isValidId(university)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid university ID"
                });
            }

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

                const minimum =
                    Number(minFees);

                if (
                    Number.isNaN(minimum) ||
                    minimum < 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid minimum fees"
                    });
                }

                universityCourseFilter
                    .annualFees
                    .$gte = minimum;
            }


            if (maxFees !== undefined) {

                const maximum =
                    Number(maxFees);

                if (
                    Number.isNaN(maximum) ||
                    maximum < 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid maximum fees"
                    });
                }

                universityCourseFilter
                    .annualFees
                    .$lte = maximum;
            }


            if (
                minFees !== undefined &&
                maxFees !== undefined &&
                Number(minFees) > Number(maxFees)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Minimum fees cannot be greater than maximum fees"
                });
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
                    "course",
                    "courseName courseCode description duration department category minimumGrade requirements mode"
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