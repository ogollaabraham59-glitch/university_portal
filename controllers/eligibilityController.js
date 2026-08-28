
const {
    User,
    Kcse,
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

    const formattedGrade =
        grade.toString()
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
    subjects,
    requiredSubject
) => {

    if (!Array.isArray(subjects)) {
        return null;
    }

    const subject = subjects.find(
        item =>
            item.subject &&
            item.subject
                .toLowerCase()
                .trim() ===
            requiredSubject
                .toLowerCase()
                .trim()
    );

    return subject ? subject.grade : null;
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
                    studentGrade &&
                    checkOverallGrade(
                        studentGrade,
                        requirement.minimumGrade
                    );

                return {
                    subject:
                        requirement.subject,

                    requiredGrade:
                        requirement.minimumGrade,

                    studentGrade:
                        studentGrade || null,

                    passed: Boolean(passed)
                };
            }
        );

    const eligible =
        subjectResults.every(
            subject => subject.passed
        );

    return {
        eligible,
        subjects: subjectResults
    };
};


// ======================================================
// 1. CHECK COURSE ELIGIBILITY
// ======================================================

const checkCourseEligibility = async (
    req,
    res
) => {

    try {

        const studentId = req.user.id;

        const { courseId } = req.params;


        // ==================================================
        // GET STUDENT
        // ==================================================

        const student =
            await User.findById(studentId);

        if (!student) {

            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }


        // ==================================================
        // GET KCSE RESULT
        // ==================================================

        const kcseResult =
            await Kcse.findOne({
                student: studentId,
                status: "Processed"
            });

        if (!kcseResult) {

            return res.status(404).json({
                success: false,
                message:
                    "Processed KCSE result not found"
            });
        }


        // ==================================================
        // GET COURSE
        // ==================================================

        const course =
            await Course.findById(courseId);

        if (!course) {

            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }


        // ==================================================
        // CHECK OVERALL GRADE
        // ==================================================

        const overallEligible =
            checkOverallGrade(
                kcseResult.meanGrade,
                course.minimumGrade
            );


        // ==================================================
        // CHECK SUBJECT REQUIREMENTS
        // ==================================================

        const subjectCheck =
            checkSubjectRequirements(
                kcseResult.extractedSubjects,
                course.subjectRequirements
            );


        // ==================================================
        // FINAL ELIGIBILITY
        // ==================================================

        const eligible =
            overallEligible &&
            subjectCheck.eligible;


        // ==================================================
        // GET UNIVERSITIES OFFERING COURSE
        // ==================================================

        let universities = [];

        if (eligible) {

            const universityCourses =
                await UniversityCourse.find({
                    course: courseId,
                    availability: true
                }).populate("university");


            universities =
                universityCourses
                    .filter(
                        item => item.university
                    )
                    .map(
                        item => ({
                            universityCourseId:
                                item._id,

                            university:
                                item.university,

                            fees:
                                item.fees,

                            intakes:
                                item.intakes,

                            mode:
                                item.mode,

                            applicationLink:
                                item.applicationLink,

                            availability:
                                item.availability
                        })
                    );
        }


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            eligible,

            course: {
                id: course._id,
                courseName:
                    course.courseName,
                duration:
                    course.duration,
                minimumGrade:
                    course.minimumGrade,
                department:
                    course.department,
                mode:
                    course.mode
            },

            student: {
                meanGrade:
                    kcseResult.meanGrade
            },

            eligibility: {

                overallGrade: {
                    studentGrade:
                        kcseResult.meanGrade,

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

        const studentId = req.user.id;


        // ==================================================
        // GET STUDENT
        // ==================================================

        const student =
            await User.findById(studentId);

        if (!student) {

            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }


        // ==================================================
        // GET KCSE RESULT
        // ==================================================

        const kcseResult =
            await Kcse.findOne({
                student: studentId,
                status: "Processed"
            });

        if (!kcseResult) {

            return res.status(404).json({
                success: false,
                message:
                    "Processed KCSE result not found"
            });
        }


        // ==================================================
        // GET ALL COURSES
        // ==================================================

        const courses =
            await Course.find();


        const eligibleCourses = [];


        // ==================================================
        // CHECK EVERY COURSE
        // ==================================================

        for (const course of courses) {

            // ----------------------------------------------
            // Overall grade
            // ----------------------------------------------

            const overallEligible =
                checkOverallGrade(
                    kcseResult.meanGrade,
                    course.minimumGrade
                );


            if (!overallEligible) {
                continue;
            }


            // ----------------------------------------------
            // Subject requirements
            // ----------------------------------------------

            const subjectCheck =
                checkSubjectRequirements(
                    kcseResult.extractedSubjects,
                    course.subjectRequirements
                );


            if (!subjectCheck.eligible) {
                continue;
            }


            // ----------------------------------------------
            // Universities
            // ----------------------------------------------

            const universityCourses =
                await UniversityCourse.find({
                    course: course._id,
                    availability: true
                }).populate("university");


            const universities =
                universityCourses
                    .filter(
                        item => item.university
                    )
                    .map(
                        item => ({

                            universityCourseId:
                                item._id,

                            university:
                                item.university,

                            fees:
                                item.fees,

                            intakes:
                                item.intakes,

                            mode:
                                item.mode,

                            applicationLink:
                                item.applicationLink,

                            availability:
                                item.availability

                        })
                    );


            // ----------------------------------------------
            // Add eligible course
            // ----------------------------------------------

            eligibleCourses.push({

                course: {

                    id:
                        course._id,

                    courseName:
                        course.courseName,

                    duration:
                        course.duration,

                    minimumGrade:
                        course.minimumGrade,

                    department:
                        course.department,

                    mode:
                        course.mode

                },

                eligibility: {

                    overallGrade: {

                        studentGrade:
                            kcseResult.meanGrade,

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
                    student.lastName

            },

            kcse: {

                meanGrade:
                    kcseResult.meanGrade,

                status:
                    kcseResult.status

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

        const studentId = req.user.id;

        const { universityId } =
            req.params;


        // ==================================================
        // GET UNIVERSITY
        // ==================================================

        const university =
            await University.findById(
                universityId
            );

        if (!university) {

            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }


        // ==================================================
        // GET KCSE RESULT
        // ==================================================

        const kcseResult =
            await Kcse.findOne({
                student: studentId,
                status: "Processed"
            });

        if (!kcseResult) {

            return res.status(404).json({
                success: false,
                message:
                    "Processed KCSE result not found"
            });
        }


        // ==================================================
        // GET UNIVERSITY COURSES
        // ==================================================

        const universityCourses =
            await UniversityCourse.find({
                university: universityId,
                availability: true
            }).populate("course");


        const eligibleCourses = [];


        // ==================================================
        // CHECK COURSES
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
            // Overall grade
            // ----------------------------------------------

            const overallEligible =
                checkOverallGrade(
                    kcseResult.meanGrade,
                    course.minimumGrade
                );


            if (!overallEligible) {
                continue;
            }


            // ----------------------------------------------
            // Subject requirements
            // ----------------------------------------------

            const subjectCheck =
                checkSubjectRequirements(
                    kcseResult.extractedSubjects,
                    course.subjectRequirements
                );


            if (!subjectCheck.eligible) {
                continue;
            }


            // ----------------------------------------------
            // Add eligible course
            // ----------------------------------------------

            eligibleCourses.push({

                universityCourseId:
                    universityCourse._id,

                course: {

                    id:
                        course._id,

                    courseName:
                        course.courseName,

                    duration:
                        course.duration,

                    minimumGrade:
                        course.minimumGrade,

                    department:
                        course.department,

                    mode:
                        course.mode

                },

                fees:
                    universityCourse.fees,

                mode:
                    universityCourse.mode,

                intakes:
                    universityCourse.intakes,

                applicationLink:
                    universityCourse.applicationLink,

                availability:
                    universityCourse.availability,

                subjectRequirements:
                    subjectCheck.subjects

            });
        }


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

                website:
                    university.website,

                logo:
                    university.logo

            },

            student: {

                meanGrade:
                    kcseResult.meanGrade

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

