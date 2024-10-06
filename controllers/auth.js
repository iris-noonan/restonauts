const express = require('express')

// ! -- Router
const router = express.Router()

// ! Routes/Controllers

// * -- Sign Up Form
// Method: GET
// Path: /auth/sign-up
router.get('/sign-up', (req, res) => {
    res.render('auth/sign-up.ejs')
  })
  
// ! Export the Router
module.exports = router