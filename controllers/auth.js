const express = require('express')
const bcrypt = require("bcrypt");

// ! -- Router
const router = express.Router()

// ! Model
const User = require('../models/user.js')
const Restaurant = require('../models/restaurant.js')

// ! Middleware Functions
const isSignedIn = require('../middleware/is-signed-in.js')

// ! Routes/Controllers

// * -- Sign Up Form
// Method: GET
// Path: /auth/sign-up
router.get('/sign-up', (req, res) => {
    res.render('auth/sign-up.ejs')
  })

// * -- Create User
router.post('/sign-up', async (req, res) => {
  // set default user role
  req.body.role = 'user'
  const userInDatabase = await User.findOne({ username: req.body.username })
  if (userInDatabase) {
    return res.send("Username already taken.")
  }
  
  if (req.body.password !== req.body.confirmPassword) {
    return res.send("Password and Confirm Password must match")
  }
  const hashedPassword = bcrypt.hashSync(req.body.password, 10)
  req.body.password = hashedPassword

  const user = await User.create(req.body)
  req.session.user = {
    username: user.username,
    role: user.role,
    _id: user._id
  }

  req.session.save(() => {
    res.redirect('/')
  })
})

// * -- Sign In Form
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs')
})

// * -- Sign In User
router.post('/sign-in', async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username })
  if (!userInDatabase) {
    return res.send('Login failed. Please try again.')
  }
  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  )
  if (!validPassword) {
    return res.send('Login failed. Please try again.')
  }


  // Create session to sign the user in
  req.session.user = {
    username: userInDatabase.username,
    role: userInDatabase.role,
    _id: userInDatabase._id
  }

  req.session.save(() => {
    res.redirect('/')
  })
})

// * Sign Out Route
router.get('/sign-out', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
})

router.get('/profile', isSignedIn, (req, res) => {
  res.render('auth/profile.ejs')
});

router.put('/profile', isSignedIn, async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (!userInDatabase) {
      return res.send('User not found')
    }
    const validPassword = bcrypt.compareSync(
      req.body.currentPassword,
      userInDatabase.password
    )
    if (!validPassword) {
      return res.send('Current password is not valid')
    }
  
    if (req.body.newPassword !== req.body.newPasswordConfirm) {
      return res.send("New Password and Confirm Password must match")
    }
    const hashedPassword = bcrypt.hashSync(req.body.newPassword, 10)
  
    userInDatabase.password = hashedPassword
  
    await userInDatabase.save()

    return res.redirect('/')
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
});

router.delete('/profile', isSignedIn, async (req, res, next) => {
  try {
    console.log('huh')

    const restaurants = await Restaurant.find({ 'ratings.user': req.session.user._id })

    for (let restaurant of restaurants) {
      restaurant.ratings = restaurant.ratings.filter(rating => !rating.user.equals(req.session.user._id))
      await restaurant.save()
    } 

    const userInDatabase = await User.findOne({ username: req.body.username })
    console.log('USER: ', userInDatabase)
    if (!userInDatabase) return next()

    if (userInDatabase._id.equals(req.session.user._id)) {
      await User.findByIdAndDelete(req.session.user._id)
      req.session.destroy(() => {
        res.redirect('/')
      })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred</h1>')
  }
})

// ! Export the Router
module.exports = router