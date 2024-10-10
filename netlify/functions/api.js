const serverless = require('serverless-http')
const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const morgan = require('morgan')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const passUserToView = require('./middleware/pass-user-to-view.js')
require('dotenv/config')

// ! -- Routers/Controllers
const restaurantsController = require('../../controllers/restaurants.js')
const authController = require('../../controllers/auth.js')


// ! -- Variables
const app = express()
const port = 3000

// ! -- Middleware
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride("_method"))
app.use(express.static('public'))
app.use(morgan('dev'))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    })
  }))
app.use(passUserToView)

// ! -- Route Handlers

// ! -- Model
const Restaurant = require('./models/restaurant.js')

const locations = {
  'UK': ['Hove', 'Brighton', 'London', 'Reading', 'Chichester'],
  'Portugal': ['Sintra', 'Lisbon', 'Porto', 'Coimbra', 'Évora'],
  'USA': ['New York', 'Chicago', 'Las Vegas', 'San Francisco', 'Los Angeles'],
  'Denmark': ['Copenhagen', 'Aarhus', 'Esbjerg', 'Aalborg', 'Odense'],
  'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Sapporo', 'Fukuoka'],
}

// * Landing Page
app.get('/', async (req, res) => {
  try {
    const country = req.query.country
    const city = req.query.city
    const countries = []
    for (const country in locations) {
      countries.push(country)
    }
    let cities = []
    let restaurants = {}
    if (!country && !city) {
      restaurants = await Restaurant.find()
    } else if (country && !city) {
      restaurants = await Restaurant.find({country})
      cities = locations[country]
    } else {
      restaurants = await Restaurant.find({country, city})
      cities = locations[country]
    }
    return res.render('index.ejs', {
      restaurants,
      countries,
      selectedCountry: country,
      cities,
      selectedCity: city,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})

// * Routers
app.use('/restaurants', restaurantsController)
app.use('/auth', authController)

// ! -- Server Connections
const startServers = async () => {
    try {
        // Database Connection
        await mongoose.connect(process.env.MONGODB_URI)
        console.log(`🔒 Connected to MongoDB ${mongoose.connection.name}.`)
    } catch (error) {
        console.log(error)
    }
}

startServers()

module.exports.handler = serverless(app)
