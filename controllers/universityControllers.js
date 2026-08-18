
const { University } = require("../models/universityModel");


// =====================================
// Add University
// =====================================

exports.addUniversity = async (req, res) => {
    try {

        const universityData = req.body;

        const newUniversity = new University(universityData);

        const savedUniversity = await newUniversity.save();

        res.status(201).json({
            message: "University created successfully",
            university: savedUniversity
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// =====================================
// Get All Universities
// =====================================

exports.getAllUniversities = async (req, res) => {
    try {

        const universities = await University.find();

        res.status(200).json(universities);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// =====================================
// Get University By ID
// =====================================

exports.getUniversityById = async (req, res) => {
    try {

        const university = await University.findById(
            req.params.id
        );

        if (!university) {

            return res.status(404).json({
                message: "University not found"
            });

        }

        res.status(200).json(university);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// =====================================
// Update University
// =====================================

exports.updateUniversity = async (req, res) => {
    try {

        const updatedUniversity =
            await University.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!updatedUniversity) {

            return res.status(404).json({
                message: "University not found"
            });

        }

        res.status(200).json({
            message: "University updated successfully",
            university: updatedUniversity
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// =====================================
// Delete University
// =====================================

exports.deleteUniversity = async (req, res) => {
    try {

        const deletedUniversity =
            await University.findByIdAndDelete(
                req.params.id
            );

        if (!deletedUniversity) {

            return res.status(404).json({
                message: "University not found"
            });

        }

        res.status(200).json({
            message: "University deleted successfully",
            university: deletedUniversity
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

