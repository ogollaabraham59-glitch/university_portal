
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const uploadDir = path.join(
    __dirname,
    "../uploads/students"
);

// Create uploads/students folder automatically
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}


// ======================================================
// STORAGE CONFIGURATION
// ======================================================

const storage = multer.diskStorage({

    // Where uploaded student pictures are stored
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    // Generate a unique filename
    filename: (req, file, cb) => {

        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        const filename =
            "student-" +
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            extension;

        cb(null, filename);
    }
});


// ======================================================
// FILE TYPE VALIDATION
// ======================================================

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed"
            ),
            false
        );
    }
};


// ======================================================
// MULTER CONFIGURATION
// ======================================================

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        // Maximum image size: 5MB
        fileSize: 5 * 1024 * 1024
    }
});


// ======================================================
// EXPORT
// ======================================================

module.exports = upload;