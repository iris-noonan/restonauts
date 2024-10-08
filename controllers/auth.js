const express = require('express')
const bcrypt = require("bcrypt");

// ! -- Router
const router = express.Router()

// ! Model
const User = require('../models/user.js')

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

router.get('/profile', (req, res) => {
  if (req.session.user) {
    res.render('auth/profile.ejs')
  } else {
    res.send("Sorry, no guests allowed.");
  }
});

// ! Export the Router
module.exports = router