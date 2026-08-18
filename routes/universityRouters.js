
const express = require("express");

const router = express.Router();

const {
    addUniversity,
    getAllUniversities,
    getUniversityById,
    updateUniversity,
    deleteUniversity
} = require("../controllers/universityController");


// Add University
router.post("/", addUniversity);

// Get All Universities
router.get("/", getAllUniversities);

// Get University By ID
router.get("/:id", getUniversityById);

// Update University
router.put("/:id", updateUniversity);

// Delete University
router.delete("/:id", deleteUniversity);


module.exports = router;

