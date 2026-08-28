const express = require("express");

const router = express.Router();

const {
    createNotification,
    getMyNotifications,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} = require("../controllers/notificationController");

const {
    auth,
    authorizeRoles
} = require("../midllewear/auth");


// ======================================================
// CREATE NOTIFICATION
// Super Admin creates notifications
// ======================================================

router.post(
    "/",
    auth,
    authorizeRoles("super_admin"),
    createNotification
);


// ======================================================
// GET MY NOTIFICATIONS
// ======================================================

router.get(
    "/",
    auth,
    authorizeRoles("student"),
    getMyNotifications
);


// ======================================================
// GET UNREAD NOTIFICATIONS
// ======================================================

router.get(
    "/unread",
    auth,
    authorizeRoles("student"),
    getUnreadNotifications
);


// ======================================================
// MARK ALL AS READ
// ======================================================

router.patch(
    "/read-all",
    auth,
    authorizeRoles("student"),
    markAllAsRead
);


// ======================================================
// MARK ONE AS READ
// ======================================================

router.patch(
    "/:id/read",
    auth,
    authorizeRoles("student"),
    markAsRead
);


// ======================================================
// DELETE ALL
// ======================================================

router.delete(
    "/",
    auth,
    authorizeRoles("student"),
    deleteAllNotifications
);


// ======================================================
// DELETE ONE
// ======================================================

router.delete(
    "/:id",
    auth,
    authorizeRoles("student"),
    deleteNotification
);


module.exports = router;