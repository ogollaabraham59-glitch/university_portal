const {
    KcseResult,
    Student
} = require("../models/universityModel");


// ======================================================
// 1. UPLOAD KCSE RESULT SLIP
// ======================================================

const uploadResultSlip = async (req, res) => {
    try {
        // ------------------------------------------
        // Student ID comes from JWT
        // ------------------------------------------

        const studentId = req.user.id;

        // ------------------------------------------
        // Get uploaded file
        // ------------------------------------------

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload your KCSE result slip"
            });
        }

        // ------------------------------------------
        // Check student
        // ------------------------------------------

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // ------------------------------------------
        // Check for existing result
        // ------------------------------------------

        const existingResult = await Kcse.findOne({
            student: studentId
        });

        if (existingResult) {
            return res.status(409).json({
                success: false,
                message: "KCSE result has already been uploaded",
                result: existingResult
            });
        }

        // ------------------------------------------
        // File path
        // ------------------------------------------

        const resultSlip = req.file.path;

        // ------------------------------------------
        // Create result
        // ------------------------------------------

        const result = await Kcse.create({
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
        // ------------------------------------------
        // Get logged-in student ID from JWT
        // ------------------------------------------

        const studentId = req.user.id;

        const result = await Kcse.findOne({
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

        const result = await Kcse.findById(id)
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

        const {
            extractedSubjects
        } = req.body;

        // ------------------------------------------
        // Find result
        // ------------------------------------------

        const result = await Kcse.findById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "KCSE result not found"
            });
        }

        // ------------------------------------------
        // Validate subjects
        // ------------------------------------------

        if (
            !extractedSubjects ||
            !Array.isArray(extractedSubjects)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Extracted subjects must be provided as an array"
            });
        }

        // ------------------------------------------
        // Save extracted subjects
        // ------------------------------------------

        result.extractedSubjects = extractedSubjects;

        // ------------------------------------------
        // Mark as processed
        // ------------------------------------------

        result.status = "Processed";

        await result.save();

        // ------------------------------------------
        // Return populated result
        // ------------------------------------------

        const processedResult = await Kcse.findById(id)
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

        // ------------------------------------------
        // Find result
        // ------------------------------------------

        const result = await Kcse.findById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "KCSE result not found"
            });
        }

        // ------------------------------------------
        // Update result slip
        // ------------------------------------------

        if (resultSlip !== undefined) {
            result.resultSlip = resultSlip;
        }

        // ------------------------------------------
        // Update extracted subjects
        // ------------------------------------------

        if (extractedSubjects !== undefined) {

            if (!Array.isArray(extractedSubjects)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Extracted subjects must be an array"
                });
            }

            result.extractedSubjects = extractedSubjects;
        }

        // ------------------------------------------
        // Update status
        // ------------------------------------------

        if (status !== undefined) {

            if (
                !["Pending", "Processed"].includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Status must be Pending or Processed"
                });
            }

            result.status = status;
        }

        await result.save();

        const updatedResult = await Kcse.findById(id)
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

        const result = await Kcse.findById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "KCSE result not found"
            });
        }

        await Kcse.findByIdAndDelete(id);

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

        const result = await Kcse.findById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "KCSE result not found"
            });
        }

        // ------------------------------------------
        // Reset processing state
        // ------------------------------------------

        result.status = "Pending";
        result.extractedSubjects = [];

        await result.save();

        /*
         * At this point you would normally send the
         * result slip to your OCR/AI processing service.
         *
         * Example:
         *
         * await processKcseDocument(result.resultSlip);
         *
         * The processing service would then update:
         *
         * extractedSubjects
         * status = "Processed"
         */

        return res.status(200).json({
            success: true,
            message:
                "KCSE result has been queued for processing",
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