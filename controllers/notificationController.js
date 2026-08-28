const {
    Notification,
    Student
} = require("../models/universityModel");


// ======================================================
// 1. CREATE NOTIFICATION
// ======================================================

const createNotification = async (req, res) => {
    try {
        const {
            student,
            title,
            message,
            type,
            link
        } = req.body;

        // ------------------------------------------
        // Validate required fields
        // ------------------------------------------

        if (!student || !title || !message) {
            return res.status(400).json({
                success: false,
                message:
                    "User, title and message are required"
            });
        }

        // ------------------------------------------
        // Check user
        // ------------------------------------------

        const studentExists = await Student.findById(student);

        if (!studentExists) {
            return res.status(404).json({
                success: false,
                message: "student not found"
            });
        }

        // ------------------------------------------
        // Create notification
        // ------------------------------------------

        const notification = await Notification.create({
            student,
            title: title.trim(),
            message: message.trim(),
            type: type || "general",
            link: link || "",
            isRead: false
        });

        return res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification
        });

    } catch (error) {
        console.error(
            "Create notification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while creating notification",
            error: error.message
        });
    }
};


// ======================================================
// 2. GET MY NOTIFICATIONS
// ======================================================

const getMyNotifications = async (req, res) => {
    try {
        // ------------------------------------------
        // Get logged-in user from JWT
        // ------------------------------------------

        const studentId = req.user.id;

        const notifications = await Notification.find({
            student: studentId
        })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {
        console.error(
            "Get my notifications error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while getting notifications",
            error: error.message
        });
    }
};


// ======================================================
// 3. GET UNREAD NOTIFICATIONS
// ======================================================

const getUnreadNotifications = async (req, res) => {
    try {
        const studentId = req.student.id;

        const notifications =
            await Notification.find({
                student: studentId,
                isRead: false
            })
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {
        console.error(
            "Get unread notifications error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while getting unread notifications",
            error: error.message
        });
    }
};


// ======================================================
// 4. MARK NOTIFICATION AS READ
// ======================================================

const markAsRead = async (req, res) => {
    try {
        const studendId = req.Student.id;
        const { id } = req.params;

        // ------------------------------------------
        // Find notification belonging to user
        // ------------------------------------------

        const notification =
            await Notification.findOne({
                _id: id,
                student: studentId
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        // ------------------------------------------
        // Mark as read
        // ------------------------------------------

        notification.isRead = true;

        await notification.save();

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        console.error(
            "Mark notification as read error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while marking notification as read",
            error: error.message
        });
    }
};


// ======================================================
// 5. MARK ALL NOTIFICATIONS AS READ
// ======================================================

const markAllAsRead = async (req, res) => {
    try {
        const studentId = req.student.id;

        const result =
            await Notification.updateMany(
                {
                    student: StudentId,
                    isRead: false
                },
                {
                    $set: {
                        isRead: true
                    }
                }
            );

        return res.status(200).json({
            success: true,
            message:
                "All notifications marked as read",
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error(
            "Mark all notifications as read error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while marking all notifications as read",
            error: error.message
        });
    }
};


// ======================================================
// 6. DELETE NOTIFICATION
// ======================================================

const deleteNotification = async (req, res) => {
    try {
        const studentId = req.student.id;
        const { id } = req.params;

        // ------------------------------------------
        // Only delete user's own notification
        // ------------------------------------------

        const notification =
            await Notification.findOneAndDelete({
                _id: id,
                student: studentId
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Notification deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete notification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while deleting notification",
            error: error.message
        });
    }
};


// ======================================================
// 7. DELETE ALL NOTIFICATIONS
// ======================================================

const deleteAllNotifications = async (req, res) => {
    try {
        const studentId = req.student.id;

        const result =
            await Notification.deleteMany({
                student: studentId
            });

        return res.status(200).json({
            success: true,
            message:
                "All notifications deleted successfully",
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error(
            "Delete all notifications error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while deleting notifications",
            error: error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    createNotification,
    getMyNotifications,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
};