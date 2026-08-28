const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(express.json())
app.use(cors())


const universityRoutes = require('./routes/universityRouters')
const loginRoutes = require('./routes/loginRoutes')
const courseRoutes = require('./routes/courseRoutes')
const studentRoutes = require('./routes/studentsRoute')
const kcseRoutes = require('./routes/kcseRoutes')
const universityCourse = require('./routes/universityCourseRouter')
const courseCategory = require('./routes/courseCategoryRoute')
const savedRoutes = require('./routes/savedRoutes')
const notification = require('./routes/notificationRoute')
const eligibilityibility = require('./routes/eligibilityRoute')



app.use('/api/university', universityRoutes)
app.use('/api/login', loginRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/kcse', kcseRoutes)
app.use('/api/course', courseRoutes)
app.use('/api/saved', savedRoutes)
app.use('/api/notification', notification)
app.use('/api/coursecategory', courseCategory)
app.use('/api/universitycourse', universityCourse)
app.use('/api/eligibility', eligibilityibility)





///connection to database
// mongoose.connect(process.env.MONGO_URL)
//     .then(() => console.log('Mongodb connected)'))
//     .catch(() => console.log('mongodb connection error', err))

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send("university api running ")
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})
