const mongoose = require("mongoose");

const {
    University,
    User,
    UniversityCourse
} = require("../models/universityModel");


// ======================================================
// 1. CREATE UNIVERSITY
// ======================================================

const createUniversity = async (req, res) => {
    try {
        const {
            name,
            location,
            county,
            country,
            universityType,
            establishedYear,
            website,
            email,
            phone,
            description,
            facilities
        } = req.body;

        if (!name || !location) {
            return res.status(400).json({
                success: false,
                message: "University name and location are required"
            });
        }

        const universityName = name.trim();

        const existingUniversity = await University.findOne({
            name: universityName
        });

        if (existingUniversity) {
            return res.status(409).json({
                success: false,
                message: "University already exists"
            });
        }

        const university = await University.create({
            name: universityName,
            location: location.trim(),
            county: county ? county.trim() : "",
            country: country ? country.trim() : "Kenya",
            universityType,
            establishedYear,
            website: website ? website.trim() : "",
            email: email ? email.toLowerCase().trim() : "",
            phone: phone ? phone.trim() : "",
            description: description ? description.trim() : "",
            facilities: Array.isArray(facilities) ? facilities : [],
            verified: false,
            isActive: true
        });

        return res.status(201).json({
            success: true,
            message: "University created successfully",
            university
        });

    } catch (error) {
        console.error("Create university error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating university",
            error: error.message
        });
    }
};


// ======================================================
// 2. GET ALL ACTIVE UNIVERSITIES
// ======================================================

const getUniversities = async (req, res) => {
    try {
        const universities = await University.find({
            isActive: true
        }).sort({
            name: 1
        });

        return res.status(200).json({
            success: true,
            count: universities.length,
            universities
        });

    } catch (error) {
        console.error("Get universities error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting universities",
            error: error.message
        });
    }
};


// ======================================================
// 3. GET UNIVERSITY BY ID
// ======================================================

const getUniversityById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid university ID"
            });
        }

        const university = await University.findById(id);

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        return res.status(200).json({
            success: true,
            university
        });

    } catch (error) {
        console.error("Get university by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting university",
            error: error.message
        });
    }
};


// ======================================================
// 4. UPDATE UNIVERSITY
// ======================================================

const updateUniversity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid university ID"
            });
        }

        const university = await University.findById(id);

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        // ------------------------------------------
        // University admin ownership check
        // ------------------------------------------

        if (req.user.role === "university_admin") {
            const admin = await User.findById(req.user.id);

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: "Administrator account not found"
                });
            }

            if (!admin.university) {
                return res.status(403).json({
                    success: false,
                    message: "No university is assigned to this administrator"
                });
            }

            if (
                admin.university.toString() !==
                university._id.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Access denied. You can only update your own university."
                });
            }
        }

        const {
            name,
            location,
            county,
            country,
            universityType,
            establishedYear,
            website,
            email,
            phone,
            description,
            facilities
        } = req.body;

        // ------------------------------------------
        // Update name
        // ------------------------------------------

        if (name !== undefined) {
            const universityName = name.trim();

            if (!universityName) {
                return res.status(400).json({
                    success: false,
                    message: "University name cannot be empty"
                });
            }

            if (universityName !== university.name) {
                const existingUniversity =
                    await University.findOne({
                        name: universityName,
                        _id: { $ne: id }
                    });

                if (existingUniversity) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "Another university already has this name"
                    });
                }

                university.name = universityName;
            }
        }

        // ------------------------------------------
        // Update other fields
        // ------------------------------------------

        if (location !== undefined) {
            university.location = location.trim();
        }

        if (county !== undefined) {
            university.county = county.trim();
        }

        if (country !== undefined) {
            university.country = country.trim();
        }

        if (universityType !== undefined) {
            if (!["Public", "Private"].includes(universityType)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "University type must be Public or Private"
                });
            }

            university.universityType = universityType;
        }

        if (establishedYear !== undefined) {
            university.establishedYear = establishedYear;
        }

        if (website !== undefined) {
            university.website = website.trim();
        }

        if (email !== undefined) {
            university.email = email.toLowerCase().trim();
        }

        if (phone !== undefined) {
            university.phone = phone.trim();
        }

        if (description !== undefined) {
            university.description = description.trim();
        }

        if (facilities !== undefined) {
            if (!Array.isArray(facilities)) {
                return res.status(400).json({
                    success: false,
                    message: "Facilities must be an array"
                });
            }

            university.facilities = facilities;
        }

        await university.save();

        return res.status(200).json({
            success: true,
            message: "University updated successfully",
            university
        });

    } catch (error) {
        console.error("Update university error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating university",
            error: error.message
        });
    }
};


// ======================================================
// 5. DELETE UNIVERSITY
// ======================================================

const deleteUniversity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid university ID"
            });
        }

        const university = await University.findById(id);

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        // ------------------------------------------
        // Prevent deleting university with courses
        // ------------------------------------------

        const linkedCourses = await UniversityCourse.countDocuments({
            university: id
        });

        if (linkedCourses > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "Cannot delete this university because it has courses assigned to it. Deactivate it instead."
            });
        }

        // ------------------------------------------
        // Soft delete
        // ------------------------------------------

        university.isActive = false;

        await university.save();

        return res.status(200).json({
            success: true,
            message: "University deactivated successfully",
            university
        });

    } catch (error) {
        console.error("Delete university error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting university",
            error: error.message
        });
    }
};


// ======================================================
// 6. VERIFY UNIVERSITY
// ======================================================

const verifyUniversity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid university ID"
            });
        }

        const university = await University.findById(id);

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        university.verified = true;

        await university.save();

        return res.status(200).json({
            success: true,
            message: "University verified successfully",
            university
        });

    } catch (error) {
        console.error("Verify university error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while verifying university",
            error: error.message
        });
    }
};


// ======================================================
// 7. ACTIVATE UNIVERSITY
// ======================================================

const activateUniversity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid university ID"
            });
        }

        const university = await University.findById(id);

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        university.isActive = true;

        await university.save();

        return res.status(200).json({
            success: true,
            message: "University activated successfully",
            university
        });

    } catch (error) {
        console.error("Activate university error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while activating university",
            error: error.message
        });
    }
};


// ======================================================
// 8. DEACTIVATE UNIVERSITY
// ======================================================

const deactivateUniversity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid university ID"
            });
        }

        const university = await University.findById(id);

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        university.isActive = false;

        await university.save();

        return res.status(200).json({
            success: true,
            message: "University deactivated successfully",
            university
        });

    } catch (error) {
        console.error("Deactivate university error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deactivating university",
            error: error.message
        });
    }
};


// ======================================================
// 9. SEARCH UNIVERSITIES
// ======================================================

const searchUniversities = async (req, res) => {
    try {
        const {
            search,
            county,
            location,
            universityType
        } = req.query;

        const filter = {
            isActive: true
        };

        // ------------------------------------------
        // General search
        // ------------------------------------------

        if (search) {
            const safeSearch = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                {
                    name: {
                        $regex: safeSearch,
                        $options: "i"
                    }
                },
                {
                    location: {
                        $regex: safeSearch,
                        $options: "i"
                    }
                },
                {
                    county: {
                        $regex: safeSearch,
                        $options: "i"
                    }
                }
            ];
        }

        // ------------------------------------------
        // County
        // ------------------------------------------

        if (county) {
            const safeCounty = county.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.county = {
                $regex: safeCounty,
                $options: "i"
            };
        }

        // ------------------------------------------
        // Location
        // ------------------------------------------

        if (location) {
            const safeLocation = location.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.location = {
                $regex: safeLocation,
                $options: "i"
            };
        }

        // ------------------------------------------
        // University type
        // ------------------------------------------

        if (universityType) {
            if (!["Public", "Private"].includes(universityType)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "University type must be Public or Private"
                });
            }

            filter.universityType = universityType;
        }

        const universities = await University.find(filter)
            .sort({
                name: 1
            });

        return res.status(200).json({
            success: true,
            count: universities.length,
            universities
        });

    } catch (error) {
        console.error("Search universities error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while searching universities",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    createUniversity,
    getUniversities,
    getUniversityById,
    updateUniversity,
    deleteUniversity,
    verifyUniversity,
    activateUniversity,
    deactivateUniversity,
    searchUniversities
};