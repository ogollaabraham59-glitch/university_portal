const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

const auth = (req, res,next) => {
    //extract uthorisazion headers
    const authHeaders = req.headers.authorization
    //get the actual token from header
    const token = authHeaders && authHeaders.split(' ')[1]//bearer
    if (!token) return res.status(401).json({ messge: "no token provided" })
    try {
        //we need to verify atoken using secret key(jwt_secrete) 
        const decoded = jwt.verify(token, JWT_SECRET)
        //attach the pay load to the request object this is the loged user
        req.user = decoded
        //proceed to the next function/route
        next()
    } catch (error) {
        res.status(401).json({ message: error.message })

    }
}
//midleweare to authorise acces based on the user role

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).res({ message: "acces denied" })
        }
        next()
    }
}
module.exports = { auth, authorizeRoles }
