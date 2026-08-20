
const express = require("express");

const router = express.Router();

const {
    addUniversity,
    getAllUniversities,
    getUniversityById,
    updateUniversity,
    deleteUniversity
} = require("../controllers/universityControllers");
const { auth, authorizeRoles } = require("../midllewear/auth");


// Add University
router.post("/", auth, authorizeRoles("university_admin", "super_admin"), addUniversity);

// Get All Universities
router.get("/", getAllUniversities);

// Get University By ID
router.get("/:id", auth, authorizeRoles("university_admin"), getUniversityById);

// Update University
router.put("/:id", auth, authorizeRoles("university_admin", "super_admin"), updateUniversity);

// Delete University
router.delete("/:id", auth, authorizeRoles("university_admin", "super_admin"), deleteUniversity);


module.exports = router;

