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
const studentRoutes = require('./routes/studentsRoutes')
const kcseRoutes = require('./routes/kcseRoutes')
const studentDashboard = require('./routes/studentDashRoutes')
const universitydashRoute = require('./routes/universitydashRoutes')
const superadmin = require('./routes/superadmindashRoutes')


app.use('/api/university', universityRoutes)
app.use('/api/login', loginRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/kcse', kcseRoutes)
app.use('/api/course', courseRoutes)
app.use('/api/studentdash', studentDashboard)
app.use('/api/universitydash', universitydashRoute)
app.use('/api/superadmin', superadmin)



///connection to database
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Mongodb connected)'))
    .catch(() => console.log('mongodb connection error', err))

app.get('/', (req, res) => {
    res.send("university api running ")
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})
