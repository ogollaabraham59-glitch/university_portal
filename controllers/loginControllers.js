const { User } = require('../models/universityModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//create the first admin acount

exports.registerAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, secretkey } = req.body
        //verify the admin secret key

        if (secretkey !== process.env.secretKey) {
            return res.status(403).json({ message: "authorize denied" })
        }
        //chek if user exist
        const userExist = await User.findOne({ email })
        if (userExist) {
            res.json({ massage: "email already taken" })
        }
        //harshing the password
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User
            ({
                firstName,
                lastName,
                email,
                phone,
                password: hashedPassword,
                role: "super_admin",
                isActive: true,
                teacher: null,
                parent: null

            })
        //save new user
        const newUser = await user.save()
        res.status(201).json({ message: "admin account created successfully", newUser })
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}
//login
exports.logIn = async (req, res) => {
    try {
        // by the email
        // check user
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "invalid credentials" })

        }
        //check if is an active
        if (!user.isActive) {
            return res.status(403).json({ message: "account has been de activated" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.status(401).json({ message: "invalid credentials" })
        }
        //jwt generetion
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '4hrs' }
        )
        //message,token,user,details
        res.json({
            message: "login succesfull",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        }
        )

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
