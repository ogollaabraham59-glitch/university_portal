const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// ===============================
// AUTHENTICATION MIDDLEWARE
// ===============================
const auth = (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        // Check if Authorization header exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach decoded user information to request
        req.user = decoded;

        // Continue to the protected route
        next();

    } catch (error) {
        console.error("Authentication error:", error.message);

        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};


// ===============================
// ROLE AUTHORIZATION MIDDLEWARE
// ===============================
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {

        // Make sure user has been authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        // Check user's role
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // User is authorized
        next();
    };
};


module.exports = {
    auth,
    authorizeRoles
};