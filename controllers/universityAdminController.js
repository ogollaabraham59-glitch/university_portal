const { User } = require('../models/universityModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//create the first admin acount

exports.registerUniversityAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body

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
                role: "university_admin",
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