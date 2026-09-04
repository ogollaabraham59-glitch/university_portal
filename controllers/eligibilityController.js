const {
    Student,
    Course,
    UniversityCourse,
    University
} = require("../models/universityModel");


// ======================================================
// KCSE GRADE VALUES
// ======================================================

const gradeValues = {
    A: 12,
    "A-": 11,
    "B+": 10,
    B: 9,
    "B-": 8,
    "C+": 7,
    C: 6,
    "C-": 5,
    "D+": 4,
    D: 3,
    "D-": 2,
    E: 1
};


// ======================================================
// CONVERT GRADE TO POINTS
// ======================================================

const getGradeValue = (grade) => {

    if (!grade) {
        return 0;
    }

    const formattedGrade = grade
        .toString()
        .trim()
        .toUpperCase();

    return gradeValues[formattedGrade] || 0;
};


// ======================================================
// CHECK OVERALL GRADE
// ======================================================

const checkOverallGrade = (
    studentGrade,
    minimumGrade
) => {

    const studentValue =
        getGradeValue(studentGrade);

    const requiredValue =
        getGradeValue(minimumGrade);

    return studentValue >= requiredValue;
};


// ======================================================
// FIND STUDENT SUBJECT GRADE
// ======================================================

const findSubjectGrade = (
    studentSubjects,
    requiredSubject
) => {

    if (!Array.isArray(studentSubjects)) {
        return null;
    }

    if (!requiredSubject) {
        return null;
    }

    const required =
        requiredSubject
            .toString()
            .trim()
            .toLowerCase();

    const subject =
        studentSubjects.find(
            item =>
                item &&
                item.subject &&
                item.subject
                    .toString()
                    .trim()
                    .toLowerCase() === required
        );

    return subject
        ? subject.grade
        : null;
};


// ======================================================
// CHECK SUBJECT REQUIREMENTS
// ======================================================

const checkSubjectRequirements = (
    studentSubjects,
    courseRequirements
) => {

    // Course has no specific subject requirements
    if (
        !Array.isArray(courseRequirements) ||
        courseRequirements.length === 0
    ) {
        return {
            eligible: true,
            subjects: []
        };
    }

    const subjectResults =
        courseRequirements.map(
            requirement => {

                const studentGrade =
                    findSubjectGrade(
                        studentSubjects,
                        requirement.subject
                    );

                const passed =
                    studentGrade
                        ? checkOverallGrade(
                            studentGrade,
                            requirement.minimumGrade
                        )
                        : false;

                return {

                    subject:
                        requirement.subject,

                    requiredGrade:
                        requirement.minimumGrade,

                    studentGrade:
                        studentGrade || null,

                    passed
                };
            }
        );

    const eligible =
        subjectResults.every(
            item => item.passed
        );

    return {
        eligible,
        subjects: subjectResults
    };
};


// ======================================================
// GET UNIVERSITIES OFFERING A COURSE
// ======================================================

const getCourseUniversities = async (
    courseId
) => {

    const universityCourses =
        await UniversityCourse.find({
            course: courseId,
            isAvailable: true
        }).populate(
            "university"
        );

    return universityCourses
        .filter(
            item => item.university
        )
        .map(
            item => ({

                universityCourseId:
                    item._id,

                university:
                    item.university,

                campus:
                    item.campus,

                annualFees:
                    item.annualFees,

                applicationFee:
                    item.applicationFee,

                mode:
                    item.mode,

                intake:
                    item.intake,

                applicationLink:
                    item.applicationLink,

                isAvailable:
                    item.isAvailable
            })
        );
};


// ======================================================
// 1. CHECK ONE COURSE ELIGIBILITY
// ======================================================

const checkCourseEligibility = async (
    req,
    res
) => {

    try {

        // ==================================================
        // STUDENT ID FROM JWT
        // ==================================================

        const studentId =
            req.user.id;

        const { courseId } =
            req.params;


        // ==================================================
        // GET STUDENT
        // ==================================================

        const student =
            await Student.findById(
                studentId
            );

        if (!student) {

            return res.status(404).json({

                success: false,

                message:
                    "Student not found"
            });
        }


        // ==================================================
        // CHECK STUDENT ACTIVE
        // ==================================================

        if (!student.isActive) {

            return res.status(403).json({

                success: false,

                message:
                    "Your student account has been deactivated"
            });
        }


        // ==================================================
        // CHECK ACADEMIC PROFILE
        // ==================================================

        if (
            !student.isAcademicProfileComplete
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please complete your academic profile first"
            });
        }


        // ==================================================
        // GET COURSE
        // ==================================================

        const course =
            await Course.findOne({
                _id: courseId,
                isActive: true
            });

        if (!course) {

            return res.status(404).json({

                success: false,

                message:
                    "Course not found or inactive"
            });
        }


        // ==================================================
        // CHECK OVERALL GRADE
        // ==================================================

        const overallEligible =
            checkOverallGrade(
                student.totalGrade,
                course.minimumGrade
            );


        // ==================================================
        // CHECK SUBJECT REQUIREMENTS
        // ==================================================

        const subjectCheck =
            checkSubjectRequirements(
                student.subjects,
                course.requirements
            );


        // ==================================================
        // FINAL ELIGIBILITY
        // ==================================================

        const eligible =
            overallEligible &&
            subjectCheck.eligible;


        // ==================================================
        // GET UNIVERSITIES
        // ==================================================

        let universities = [];

        if (eligible) {

            universities =
                await getCourseUniversities(
                    course._id
                );
        }


        // ==================================================
        // CHECK WHETHER STUDENT IS INTERESTED
        // ==================================================

        const isInterested =
            Array.isArray(
                student.interestedCourses
            ) &&
            student.interestedCourses.some(
                id =>
                    id.toString() ===
                    course._id.toString()
            );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            eligible,

            course: {

                id:
                    course._id,

                courseName:
                    course.courseName,

                courseCode:
                    course.courseCode,

                description:
                    course.description,

                duration:
                    course.duration,

                department:
                    course.department,

                minimumGrade:
                    course.minimumGrade,

                mode:
                    course.mode
            },

            student: {

                id:
                    student._id,

                firstName:
                    student.firstName,

                lastName:
                    student.lastName,

                totalGrade:
                    student.totalGrade,

                yearOfCompletion:
                    student.yearOfCompletion
            },

            isInterested,

            eligibility: {

                overallGrade: {

                    studentGrade:
                        student.totalGrade,

                    requiredGrade:
                        course.minimumGrade,

                    passed:
                        overallEligible
                },

                subjects:
                    subjectCheck.subjects
            },

            universities

        });

    } catch (error) {

        console.error(
            "Check course eligibility error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while checking eligibility",

            error:
                error.message
        });
    }
};


// ======================================================
// 2. GET MY ELIGIBLE COURSES
// ======================================================

const getMyEligibleCourses = async (
    req,
    res
) => {

    try {

        // ==================================================
        // STUDENT ID
        // ==================================================

        const studentId =
            req.user.id;


        // ==================================================
        // GET STUDENT
        // ==================================================

        const student =
            await Student.findById(
                studentId
            );

        if (!student) {

            return res.status(404).json({

                success: false,

                message:
                    "Student not found"
            });
        }


        // ==================================================
        // CHECK ACTIVE ACCOUNT
        // ==================================================

        if (!student.isActive) {

            return res.status(403).json({

                success: false,

                message:
                    "Your student account has been deactivated"
            });
        }


        // ==================================================
        // CHECK ACADEMIC PROFILE
        // ==================================================

        if (
            !student.isAcademicProfileComplete
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please complete your academic profile first"
            });
        }


        // ==================================================
        // GET ACTIVE COURSES
        // ==================================================

        const courses =
            await Course.find({
                isActive: true
            });


        const eligibleCourses = [];


        // ==================================================
        // CHECK EVERY COURSE
        // ==================================================

        for (
            const course
            of courses
        ) {

            // ----------------------------------------------
            // OVERALL GRADE
            // ----------------------------------------------

            const overallEligible =
                checkOverallGrade(
                    student.totalGrade,
                    course.minimumGrade
                );


            if (!overallEligible) {
                continue;
            }


            // ----------------------------------------------
            // SUBJECT REQUIREMENTS
            // ----------------------------------------------

            const subjectCheck =
                checkSubjectRequirements(
                    student.subjects,
                    course.requirements
                );


            if (!subjectCheck.eligible) {
                continue;
            }


            // ----------------------------------------------
            // UNIVERSITIES
            // ----------------------------------------------

            const universities =
                await getCourseUniversities(
                    course._id
                );


            // ----------------------------------------------
            // CHECK INTEREST
            // ----------------------------------------------

            const isInterested =
                Array.isArray(
                    student.interestedCourses
                ) &&
                student.interestedCourses.some(
                    id =>
                        id.toString() ===
                        course._id.toString()
                );


            // ----------------------------------------------
            // ADD COURSE
            // ----------------------------------------------

            eligibleCourses.push({

                course: {

                    id:
                        course._id,

                    courseName:
                        course.courseName,

                    courseCode:
                        course.courseCode,

                    description:
                        course.description,

                    duration:
                        course.duration,

                    department:
                        course.department,

                    minimumGrade:
                        course.minimumGrade,

                    mode:
                        course.mode
                },

                isInterested,

                eligibility: {

                    overallGrade: {

                        studentGrade:
                            student.totalGrade,

                        requiredGrade:
                            course.minimumGrade,

                        passed:
                            overallEligible
                    },

                    subjects:
                        subjectCheck.subjects
                },

                universities
            });
        }


        // ==================================================
        // PRIORITIZE STUDENT'S INTERESTED COURSES
        // ==================================================

        eligibleCourses.sort(
            (a, b) =>
                Number(b.isInterested) -
                Number(a.isInterested)
        );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            student: {

                id:
                    student._id,

                firstName:
                    student.firstName,

                lastName:
                    student.lastName,

                totalGrade:
                    student.totalGrade,

                yearOfCompletion:
                    student.yearOfCompletion,

                interestedCourses:
                    student.interestedCourses
            },

            count:
                eligibleCourses.length,

            eligibleCourses

        });

    } catch (error) {

        console.error(
            "Get eligible courses error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while getting eligible courses",

            error:
                error.message
        });
    }
};


// ======================================================
// 3. GET ELIGIBLE COURSES BY UNIVERSITY
// ======================================================

const getEligibleCoursesByUniversity = async (
    req,
    res
) => {

    try {

        const studentId =
            req.user.id;

        const { universityId } =
            req.params;


        // ==================================================
        // GET STUDENT
        // ==================================================

        const student =
            await Student.findById(
                studentId
            );

        if (!student) {

            return res.status(404).json({

                success: false,

                message:
                    "Student not found"
            });
        }


        // ==================================================
        // CHECK ACTIVE ACCOUNT
        // ==================================================

        if (!student.isActive) {

            return res.status(403).json({

                success: false,

                message:
                    "Your student account has been deactivated"
            });
        }


        // ==================================================
        // CHECK ACADEMIC PROFILE
        // ==================================================

        if (
            !student.isAcademicProfileComplete
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please complete your academic profile first"
            });
        }


        // ==================================================
        // GET UNIVERSITY
        // ==================================================

        const university =
            await University.findOne({
                _id: universityId,
                isActive: true
            });

        if (!university) {

            return res.status(404).json({

                success: false,

                message:
                    "University not found or inactive"
            });
        }


        // ==================================================
        // GET UNIVERSITY COURSES
        // ==================================================

        const universityCourses =
            await UniversityCourse.find({

                university:
                    universityId,

                isAvailable:
                    true

            }).populate(
                "course"
            );


        const eligibleCourses = [];


        // ==================================================
        // CHECK EACH COURSE
        // ==================================================

        for (
            const universityCourse
            of universityCourses
        ) {

            const course =
                universityCourse.course;


            if (!course) {
                continue;
            }


            // ----------------------------------------------
            // COURSE MUST BE ACTIVE
            // ----------------------------------------------

            if (!course.isActive) {
                continue;
            }


            // ----------------------------------------------
            // OVERALL GRADE
            // ----------------------------------------------

            const overallEligible =
                checkOverallGrade(
                    student.totalGrade,
                    course.minimumGrade
                );


            if (!overallEligible) {
                continue;
            }


            // ----------------------------------------------
            // SUBJECT REQUIREMENTS
            // ----------------------------------------------

            const subjectCheck =
                checkSubjectRequirements(
                    student.subjects,
                    course.requirements
                );


            if (!subjectCheck.eligible) {
                continue;
            }


            // ----------------------------------------------
            // INTERESTED COURSE
            // ----------------------------------------------

            const isInterested =
                Array.isArray(
                    student.interestedCourses
                ) &&
                student.interestedCourses.some(
                    id =>
                        id.toString() ===
                        course._id.toString()
                );


            // ----------------------------------------------
            // ADD COURSE
            // ----------------------------------------------

            eligibleCourses.push({

                universityCourseId:
                    universityCourse._id,

                course: {

                    id:
                        course._id,

                    courseName:
                        course.courseName,

                    courseCode:
                        course.courseCode,

                    description:
                        course.description,

                    duration:
                        course.duration,

                    department:
                        course.department,

                    minimumGrade:
                        course.minimumGrade,

                    mode:
                        course.mode
                },

                isInterested,

                campus:
                    universityCourse.campus,

                annualFees:
                    universityCourse.annualFees,

                applicationFee:
                    universityCourse.applicationFee,

                mode:
                    universityCourse.mode,

                intake:
                    universityCourse.intake,

                applicationLink:
                    universityCourse.applicationLink,

                isAvailable:
                    universityCourse.isAvailable,

                subjectRequirements:
                    subjectCheck.subjects
            });
        }


        // ==================================================
        // PRIORITIZE INTERESTED COURSES
        // ==================================================

        eligibleCourses.sort(
            (a, b) =>
                Number(b.isInterested) -
                Number(a.isInterested)
        );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            university: {

                id:
                    university._id,

                name:
                    university.name,

                location:
                    university.location,

                county:
                    university.county,

                country:
                    university.country,

                website:
                    university.website,

                logo:
                    university.logo,

                description:
                    university.description
            },

            student: {

                id:
                    student._id,

                firstName:
                    student.firstName,

                lastName:
                    student.lastName,

                totalGrade:
                    student.totalGrade
            },

            count:
                eligibleCourses.length,

            eligibleCourses

        });

    } catch (error) {

        console.error(
            "Get university eligible courses error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while getting university eligible courses",

            error:
                error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    checkCourseEligibility,

    getMyEligibleCourses,

    getEligibleCoursesByUniversity

};