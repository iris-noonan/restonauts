const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const morgan = require('morgan')
require('dotenv/config')

// ! -- Routers/Controllers
const authController = require('./controllers/auth.js')


// ! -- Variables
const app = express()
const port = 3000

// ! -- Middleware
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride("_method"))
app.use(express.static('public'))
app.use(morgan('dev'))

// ! -- Route Handlers
app.use('/auth', authController)

// * Landing Page
app.get('/', async (req, res) => {
    res.render('index.ejs')
  })

// * Routers

// ! -- Server Connections
const startServers = async () => {
    try {
        // Database Connection
        await mongoose.connect(process.env.MONGODB_URI)
        console.log(`🔒 Connected to MongoDB ${mongoose.connection.name}.`)
        // Server Connection
        app.listen(port, () => {
            console.log(`🚀 Sever up and running on port ${port}`)
        })
    } catch (error) {
        console.log(error)
    }
}

startServers()