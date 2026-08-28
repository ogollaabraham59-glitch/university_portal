const express = require("express");

const router = express.Router();

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    activateCategory,
    deactivateCategory
} = require("../controllers/courseCtegoryController");

const {
    auth,
    authorizeRoles
} = require("../midllewear/auth");


// ======================================================
// PUBLIC
// ======================================================

// Get active categories
router.get(
    "/",
    getCategories
);


// Get category by ID
router.get(
    "/:id",
    getCategoryById
);


// ======================================================
// SUPER ADMIN
// ======================================================

// Create category
router.post(
    "/",
    auth,
    authorizeRoles("super_admin"),
    createCategory
);


// Update category
router.put(
    "/:id",
    auth,
    authorizeRoles("super_admin"),
    updateCategory
);


// Delete category
router.delete(
    "/:id",
    auth,
    authorizeRoles("super_admin"),
    deleteCategory
);


// Activate category
router.put(
    "/:id/activate",
    auth,
    authorizeRoles("super_admin"),
    activateCategory
);


// Deactivate category
router.put(
    "/:id/deactivate",
    auth,
    authorizeRoles("super_admin"),
    deactivateCategory
);


module.exports = router;