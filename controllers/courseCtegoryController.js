const { CourseCategory } = require("../models/universityModel");


// ======================================================
// 1. CREATE CATEGORY
// ======================================================

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // ------------------------------------------
        // Validate required field
        // ------------------------------------------

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        // ------------------------------------------
        // Check if category already exists
        // ------------------------------------------

        const existingCategory = await CourseCategory.findOne({
            name: name.trim()
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Course category already exists"
            });
        }

        // ------------------------------------------
        // Create category
        // ------------------------------------------

        const category = await CourseCategory.create({
            name: name.trim(),
            description: description
                ? description.trim()
                : "",
            isActive: true
        });

        return res.status(201).json({
            success: true,
            message: "Course category created successfully",
            category
        });

    } catch (error) {
        console.error("Create category error:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Course category already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while creating course category",
            error: error.message
        });
    }
};


// ======================================================
// 2. GET ALL CATEGORIES
// ======================================================

const getCategories = async (req, res) => {
    try {
        const categories = await CourseCategory.find({
            isActive: true
        }).sort({
            name: 1
        });

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {
        console.error("Get categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting course categories",
            error: error.message
        });
    }
};


// ======================================================
// 3. GET CATEGORY BY ID
// ======================================================

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await CourseCategory.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Course category not found"
            });
        }

        return res.status(200).json({
            success: true,
            category
        });

    } catch (error) {
        console.error("Get category by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while getting course category",
            error: error.message
        });
    }
};


// ======================================================
// 4. UPDATE CATEGORY
// ======================================================

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            description
        } = req.body;

        // ------------------------------------------
        // Find category
        // ------------------------------------------

        const category = await CourseCategory.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Course category not found"
            });
        }

        // ------------------------------------------
        // Update name
        // ------------------------------------------

        if (name !== undefined) {

            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Category name cannot be empty"
                });
            }

            // Check duplicate name
            const existingCategory =
                await CourseCategory.findOne({
                    name: name.trim(),
                    _id: { $ne: id }
                });

            if (existingCategory) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Another course category already has this name"
                });
            }

            category.name = name.trim();
        }

        // ------------------------------------------
        // Update description
        // ------------------------------------------

        if (description !== undefined) {
            category.description = description.trim();
        }

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Course category updated successfully",
            category
        });

    } catch (error) {
        console.error("Update category error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Course category already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while updating course category",
            error: error.message
        });
    }
};


// ======================================================
// 5. DELETE CATEGORY
// ======================================================

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await CourseCategory.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Course category not found"
            });
        }

        await CourseCategory.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Course category deleted successfully"
        });

    } catch (error) {
        console.error("Delete category error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting course category",
            error: error.message
        });
    }
};


// ======================================================
// 6. ACTIVATE CATEGORY
// ======================================================

const activateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await CourseCategory.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Course category not found"
            });
        }

        category.isActive = true;

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Course category activated successfully",
            category
        });

    } catch (error) {
        console.error("Activate category error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while activating course category",
            error: error.message
        });
    }
};


// ======================================================
// 7. DEACTIVATE CATEGORY
// ======================================================

const deactivateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await CourseCategory.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Course category not found"
            });
        }

        category.isActive = false;

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Course category deactivated successfully",
            category
        });

    } catch (error) {
        console.error("Deactivate category error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deactivating course category",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    activateCategory,
    deactivateCategory
};