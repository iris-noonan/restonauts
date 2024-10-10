const mongoose = require('mongoose')
const express = require('express')

// ! -- Router
const router = express.Router()

// ! -- Model
const Restaurant = require('../models/restaurant.js')

// ! Middleware Functions
const isSignedIn = require('../middleware/is-signed-in.js')

// ! -- Routes
// * Each route is already prepended with `/restaurants`

// * New Page (form page)
router.get('/new', isSignedIn, (req, res) => {
  res.render('restaurants/new.ejs')
})

// * Show Page
router.get('/:restaurantId', async (req, res, next) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.restaurantId)) {
      const restaurant = await Restaurant.findById(req.params.restaurantId).populate('owner').populate('ratings.user')
      if (!restaurant) return next()
      return res.render('restaurants/show.ejs', { restaurant })
    } else {
      next()
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})

// * Create Route
router.post('/', isSignedIn, async (req, res) => {
  try {
    console.log(req.body)
    req.body.owner = req.session.user._id // Add the owner ObjectId using the authenticated user's _id (from the session)
    const restaurant = await Restaurant.create(req.body)
    req.session.message = 'Restaurant created successfully'
    req.session.save(() => {
      return res.redirect('/restaurants')
    })
  } catch (error) {
    console.log(error)
    return res.status(500).render('restaurants/new.ejs', {
      errors: error.errors,
      fieldValues: req.body
    })
  }
})

// * Delete Route
router.delete('/:restaurantId', async (req, res) => {
  try {
    const restaurantToDelete = await Restaurant.findById(req.params.restaurantId)

    if (restaurantToDelete.owner.equals(req.session.user._id)) {
      const deletedRestaurant = await Restaurant.findByIdAndDelete(req.params.restaurantId)
      return res.redirect('/restaurants')
    }

    throw new Error('User is not authorised to perform this action')
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})

router.get('/:restaurantId/edit', isSignedIn, async (req, res, next) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.restaurantId)) {
      const restaurant = await Restaurant.findById(req.params.restaurantId)
      if (!restaurant) return next()

      if (!restaurant.owner.equals(req.session.user._id)) {
        return res.redirect(`/restaurants/${req.params.restaurantId}`)
      }

      return res.render('restaurants/edit.ejs', { restaurant })
    }
    next()
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})

router.put('/:restaurantId', isSignedIn, async (req, res) => {
  try {
    const restaurantToUpdate = await Restaurant.findById(req.params.restaurantId)
    
    if (restaurantToUpdate.owner.equals(req.session.user._id)) {
      const updatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.restaurantId, req.body, { new: true })
      return res.redirect(`/restaurants/${req.params.restaurantId}`)
    }
    
    throw new Error('User is not authorised to perform this action')
    
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})

// ! Ratings Section

// * -- Create Rating
router.post('/:restaurantId/ratings', async (req, res, next) => {
  try {

    // Add signed in user id to the user field
    req.body.user = req.session.user._id

    // Find the restaurant that we want to add the rating to
    const restaurant = await Restaurant.findById(req.params.restaurantId)
    if (!restaurant) return next() // send 404

    // Push the req.body (new rating) into the ratings array
    restaurant.ratings.push(req.body)

    // Save the restaurant we just added the rating to - this will persist to the database
    await restaurant.save()

    return res.redirect(`/restaurants/${req.params.restaurantId}`)
  } catch (error) {
    req.session.message = error.message

    req.session.save(() => {
      return res.redirect(`/restaurants/${req.params.restaurantId}`)
    })
  }
})

// * -- Edit Rating
router.put('/:restaurantId/ratings/:ratingId', isSignedIn, async (req, res, next) => {
    try {
      const restaurantToUpdate = await Restaurant.findById(req.params.restaurantId)
      if (!restaurantToUpdate) return next()

      // Locate rating to update
      const ratingToUpdate = restaurantToUpdate.ratings.id(req.params.ratingId)
      if (!ratingToUpdate) return next()
      
      ratingToUpdate.score = req.body.score
      ratingToUpdate.comment = req.body.comment

      restaurantToUpdate.save()
      return res.redirect(`/restaurants/${req.params.restaurantId}`)

    } catch (error) {
      console.log(error)
      return res.status(500).send('<h1>An error occurred.</h1>')
    }
  })

// * -- Delete Rating
router.delete('/:restaurantId/ratings/:ratingId', isSignedIn, async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId)
    if (!restaurant) return next()
    
    // Locate rating to delete
    const ratingToDelete = restaurant.ratings.id(req.params.ratingId)
    if (!ratingToDelete) return next()

    // Ensure user is authorized
    if (!ratingToDelete.user.equals(req.session.user._id)) {
      throw new Error('User not authorized to perform this action.')
    }
    
    // Delete rating (this does not make a call to the db)
    ratingToDelete.deleteOne()

    // Persist changed to database (this does make a call to the db)
    await restaurant.save()

    // Redirect back to show page
    return res.redirect(`/restaurants/${req.params.restaurantId}`)
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred</h1>')
  }
})


module.exports = router