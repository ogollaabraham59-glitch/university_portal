const { KcseResult, User } = require("../models/universityModel");

// =========================
// Create KCSE Result
// =========================
exports.addKcseResult = async (req, res) => {
    try {

        const {
            student,
            resultSlip,
            extractedSubjects
        } = req.body;

        // Check if student exists
        const studentExist = await User.findById(student);

        if (!studentExist) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Prevent duplicate result
        const existingResult = await KcseResult.findOne({ student });

        if (existingResult) {
            return res.status(400).json({
                message: "KCSE result already uploaded."
            });
        }

        const newResult = new KcseResult({
            student,
            resultSlip,
            extractedSubjects,
            status: "Pending"
        });

        const savedResult = await newResult.save();

        res.status(201).json(savedResult);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// =========================
// Get All Results
// =========================
exports.getAllKcseResults = async (req, res) => {

    try {

        const results = await KcseResult.find()
            .populate("student");

        res.status(200).json(results);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// =========================
// Get Result By ID
// =========================
exports.getKcseResultById = async (req, res) => {

    try {

        const result = await KcseResult.findById(req.params.id)
            .populate("student");

        if (!result) {

            return res.status(404).json({
                message: "KCSE Result not found"
            });

        }

        res.status(200).json(result);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// =========================
// Update Result
// =========================
exports.updateKcseResult = async (req, res) => {

    try {

        const updatedResult = await KcseResult.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate("student");

        if (!updatedResult) {

            return res.status(404).json({
                message: "KCSE Result not found"
            });

        }

        res.status(200).json(updatedResult);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// =========================
// Delete Result
// =========================
exports.deleteKcseResult = async (req, res) => {

    try {

        const deletedResult = await KcseResult.findByIdAndDelete(req.params.id);

        if (!deletedResult) {

            return res.status(404).json({
                message: "KCSE Result not found"
            });

        }

        res.status(200).json({
            message: "KCSE Result deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};