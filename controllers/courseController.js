const { Course, University } = require("../models/universityModel");

// Create Course
exports.addCourse = async (req, res) => {
    try {

        const {
            university,
            courseName,
            duration,
            annualFees,
            minimumGrade,
            department,
            mode
        } = req.body;

        // Check if university exists
        const universityExist = await University.findById(university);

        if (!universityExist) {
            return res.status(404).json({
                message: "University not found"
            });
        }

        // Prevent duplicate course in the same university
        const courseExist = await Course.findOne({
            university,
            courseName
        });

        if (courseExist) {
            return res.status(400).json({
                message: "Course already exists in this university"
            });
        }

        const newCourse = new Course({
            university,
            courseName,
            duration,
            annualFees,
            minimumGrade,
            department,
            mode
        });

        const savedCourse = await newCourse.save();

        res.status(201).json(savedCourse);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// Get All Courses
exports.getAllCourses = async (req, res) => {

    try {

        const courses = await Course.find()
            .populate("university");

        res.status(200).json(courses);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// Get Course By Id
exports.getCourseById = async (req, res) => {

    try {

        const course = await Course.findById(req.params.id)
            .populate("university");

        if (!course) {

            return res.status(404).json({
                message: "Course not found"
            });

        }

        res.status(200).json(course);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// Update Course
exports.updateCourse = async (req, res) => {

    try {

        const updatedCourse = await Course.findByIdAndUpdate(

            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }

        ).populate("university");

        if (!updatedCourse) {

            return res.status(404).json({
                message: "Course not found"
            });

        }

        res.status(200).json(updatedCourse);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// Delete Course
exports.deleteCourse = async (req, res) => {

    try {

        const deletedCourse = await Course.findByIdAndDelete(req.params.id);

        if (!deletedCourse) {

            return res.status(404).json({
                message: "Course not found"
            });

        }

        res.status(200).json({
            message: "Course deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};