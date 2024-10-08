// Imports
const mongoose = require('mongoose')
require('dotenv/config')

// Models
const Restaurant = require('../models/restaurant.js')
const User = require('../models/user.js')

// Data
const restaurantData = require('./data/restaurants.js')
const userData = require('./data/users.js')

// Run seeds
const runSeeds = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('🔒 Database connection established')

    // Clear existing restaurants
    const deletedRestaurants = await Restaurant.deleteMany()
    console.log(`❌ ${deletedRestaurants.deletedCount} restaurants deleted from the database`)

    // Clear existing users
    const deletedUsers = await User.deleteMany()
    console.log(`❌ ${deletedUsers.deletedCount} users deleted from the database`)

    // Add new users
    const users = await User.create(userData)
    console.log(`👤 ${users.length} users added to the database`)
  
    const restaurantsWithOwner = restaurantData.map(restaurant => {
      restaurant.owner = users[0]._id
      return restaurant
    })
    
    // Add new restaurants
    const restaurants = await Restaurant.create(restaurantsWithOwner)
    console.log(`🌱 ${restaurants.length} restaurant added to the database`)

    // Close connection to the database
    await mongoose.connection.close()
    console.log('👋 Closing connection to MongoDB')
  } catch (error) {
    console.log(error)
  }
}

runSeeds()
