const mongoose = require("mongoose");

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
            type
        } = req.body;

        // ------------------------------------------
        // Validate required fields
        // ------------------------------------------

        if (!student || !title || !message) {
            return res.status(400).json({
                success: false,
                message: "Student, title and message are required"
            });
        }

        // ------------------------------------------
        // Validate student ID
        // ------------------------------------------

        if (!mongoose.Types.ObjectId.isValid(student)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID"
            });
        }

        // ------------------------------------------
        // Check student
        // ------------------------------------------

        const studentExists = await Student.findById(student);

        if (!studentExists) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // ------------------------------------------
        // Validate notification type
        // ------------------------------------------

        const allowedTypes = [
            "application",
            "recommendation",
            "course",
            "university",
            "system"
        ];

        const notificationType = type || "system";

        if (!allowedTypes.includes(notificationType)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid notification type"
            });
        }

        // ------------------------------------------
        // Create notification
        // ------------------------------------------

        const notification = await Notification.create({
            recipient: student,
            recipientType: "Student",
            title: title.trim(),
            message: message.trim(),
            type: notificationType,
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
        const studentId = req.user.id;

        const notifications = await Notification.find({
            recipient: studentId,
            recipientType: "Student"
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
        const studentId = req.user.id;

        const notifications = await Notification.find({
            recipient: studentId,
            recipientType: "Student",
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
        const studentId = req.user.id;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID"
            });
        }

        // ------------------------------------------
        // Find notification belonging to student
        // ------------------------------------------

        const notification = await Notification.findOne({
            _id: id,
            recipient: studentId,
            recipientType: "Student"
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
        const studentId = req.user.id;

        const result = await Notification.updateMany(
            {
                recipient: studentId,
                recipientType: "Student",
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
        const studentId = req.user.id;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID"
            });
        }

        // ------------------------------------------
        // Only delete student's own notification
        // ------------------------------------------

        const notification =
            await Notification.findOneAndDelete({
                _id: id,
                recipient: studentId,
                recipientType: "Student"
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
        const studentId = req.user.id;

        const result =
            await Notification.deleteMany({
                recipient: studentId,
                recipientType: "Student"
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