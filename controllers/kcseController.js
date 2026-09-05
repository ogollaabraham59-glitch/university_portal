const mongoose = require("mongoose");

const {
    KcseResult,
    Student
} = require("../models/universityModel");


// ======================================================
// 1. UPLOAD KCSE RESULT SLIP
// ======================================================

const uploadResultSlip = async (req, res) => {
    try {
        // Student ID comes from JWT
        const studentId = req.user.id;

        // Check uploaded file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload your KCSE result slip"
            });
        }

        // Check student
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        if (!student.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your student account has been deactivated"
            });
        }

        // Check for existing result
        const existingResult = await KcseResult.findOne({
            student: studentId
        });

        if (existingResult) {
            return res.status(409).json({
                success: false,
                message: "KCSE result has already been uploaded",
                result: existingResult
            });
        }

        // Uploaded file path
        const resultSlip = req.file.path;

        // Create result
        const result = await KcseResult.create({
            student: studentId,
            resultSlip,
            status: "Pending",
            extractedSubjects: []
        });

        return res.status(201).json({
            success: true,
            message:
                "KCSE result slip uploaded successfully and is waiting for processing",
            result
        });

    } catch (error) {
        console.error("Upload KCSE result error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while uploading KCSE result",
            error: error.message
        });
    }
};


// ======================================================
// 2. GET MY KCSE RESULT
// ======================================================

const getMyResult = async (req, res) => {
    try {
        const studentId = req.user.id;

        const result = await KcseResult.findOne({
            student: studentId
        }).populate(
            "student",
            "firstName lastName email phone indexNo yearOfCompletion"
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "You have not uploaded a KCSE result"
            });
        }

        return res.status(200).json({
            success: true,
            result
        });

    } catch (error) {
        console.error("Get my KCSE result error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting your KCSE result",
            error: error.message
        });
    }
};


// ======================================================
// 3. GET RESULT BY ID
// ======================================================

const getResultById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid KCSE result ID"
            });
        }

        const result = await KcseResult.findById(id)
            .populate(
                "student",
                "firstName lastName email phone indexNo yearOfCompletion"
            );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "KCSE result not found"
            });
        }

        // Student can only access their own result
        if (
            req.user.role === "student" &&
            result.student._id.toString() !== req.user.id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only view your own KCSE result."
            });
        }

        return res.status(200).json({
            success: true,
            result
        });

    } catch (error) {
        console.error("Get KCSE result error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting KCSE result",
            error: error.message
        });
    }
};


// ======================================================
// 4. PROCESS KCSE RESULT
// ======================================================

const processResult = async (req, res) => {
    try {
        const { id } = req.params;
        const { extractedSubjects } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid KCSE result ID"
            });
        }

        // Find result
        const result = await KcseResult.findById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "KCSE result not found"
            });
        }

        // Validate subjects
        if (!Array.isArray(extractedSubjects)) {
            return res.status(400).json({
                success: false,
                message: "Extracted subjects must be provided as an array"
            });
        }

        // Save extracted subjects
        result.extractedSubjects = extractedSubjects;

        // Mark as processed
        result.status = "Processed";

        await result.save();

        const processedResult = await KcseResult.findById(id)
            .populate(
                "student",
                "firstName lastName email indexNo yearOfCompletion"
            );

        return res.status(200).json({
            success: true,
            message: "KCSE result processed successfully",
            result: processedResult
        });

    } catch (error) {
        console.error("Process KCSE result error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while processing KCSE result",
            error: error.message
        });
    }
};


// ======================================================
// 5. UPDATE KCSE RESULT
// ======================================================

const updateResult = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            resultSlip,
            extractedSubjects,
            status
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid KCSE result ID"
            });
        }

        // Find result
        const result = await KcseResult.findById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "KCSE result not found"
            });
        }

        // Update result slip
        if (resultSlip !== undefined) {
            result.resultSlip = resultSlip;
        }

        // Update extracted subjects
        if (extractedSubjects !== undefined) {

            if (!Array.isArray(extractedSubjects)) {
                return res.status(400).json({
                    success: false,
                    message: "Extracted subjects must be an array"
                });
            }

            result.extractedSubjects = extractedSubjects;
        }

        // Update status
        if (status !== undefined) {

            if (!["Pending", "Processed", "Failed"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Status must be Pending, Processed, or Failed"
                });
            }

            result.status = status;
        }

        await result.save();

        const updatedResult = await KcseResult.findById(id)
            .populate(
                "student",
                "firstName lastName email indexNo yearOfCompletion"
            );

        return res.status(200).json({
            success: true,
            message: "KCSE result updated successfully",
            result: updatedResult
        });

    } catch (error) {
        console.error("Update KCSE result error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating KCSE result",
            error: error.message
        });
    }
};


// ======================================================
// 6. DELETE KCSE RESULT
// ======================================================

const deleteResult = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid KCSE result ID"
            });
        }

        const result = await KcseResult.findById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "KCSE result not found"
            });
        }

        await KcseResult.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "KCSE result deleted successfully"
        });

    } catch (error) {
        console.error("Delete KCSE result error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting KCSE result",
            error: error.message
        });
    }
};


// ======================================================
// 7. RETRY KCSE RESULT PROCESSING
// ======================================================

const retryProcessing = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid KCSE result ID"
            });
        }

        const result = await KcseResult.findById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "KCSE result not found"
            });
        }

        // Reset processing state
        result.status = "Pending";
        result.extractedSubjects = [];

        await result.save();

        /*
         * Later, you can connect an OCR/AI service here.
         *
         * Example:
         *
         * await processKcseDocument(result.resultSlip);
         */

        return res.status(200).json({
            success: true,
            message: "KCSE result has been queued for processing",
            result
        });

    } catch (error) {
        console.error("Retry KCSE processing error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Server error while retrying KCSE result processing",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    uploadResultSlip,
    getMyResult,
    getResultById,
    processResult,
    updateResult,
    deleteResult,
    retryProcessing
};