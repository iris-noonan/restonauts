# Restonauts

<p align="center">
  <img alt="concentration matching game logo" src="./public/images/restonauts-logo.svg" width="320">
  </a>
</p>

## Description

A restaurant review app with a list of 5 countries and 5 cities. Select a country and then a city to show a list of restaurants for that city. Select a restaurant to show description, address and ratings if there are any. Sign up as a user to leave a rating, edit a ratind and delete a rating. If having an admin role, a new restaurant can be added, edited and deleted. A user accounted can be deleted and the password can be edited.

### Links

Project planning link: [Trello link](https://trello.com/b/9FBcBT3a/project-two-men-stack-crud)

GitHub repo link: [GitHub link](https://github.com/iris-noonan/restonauts)

Deployed project link: [Netlify link](https://restonauts.netlify.app/)

## Getting Started

Install dependancies:
```
npm install
```

Seed DB:
```
node db/seeds.js
```

Start:
```
nodemon
```

Push to GitHub to see latest automatically deployed to Netlify

## Timeframe

One week solo project. Early planning and initial start on the Firday. Presented and finished the next Friday.

## Technologies used

* HTML (in EJS)
* CSS
* JavaScript (in EJS)
* EJS
* SVGs
* Netlify
* Cloudinary

## Brief

* MEN Stack CRUD App demonstrating all calls in CRUD. 
* ERD with at least one dependancy. 
* Use EJS for the project. 
* Deployment using Netlify. 
* Use Trello or another similar tool for project planning.

## Planning

* I didn't do any sketched, I went straight to Excalidraw
* I made a wireframe for the main pages using Excalidraw. You can see them on the Trello board
* I created an ERD, you can se that on Trello
* I used Trello to plan and moved tasks as I completed them
* No pseudocode
* No paring

## Code Process

Using Query strings to render landing page list of restaurants. This sets country and city based on the query string. Then creates the array of countries and cities based on a hardcoded object to represent the current cities that the website is featuring. Then there are three if options for which set of retaurants are shown. This is then used to show the buttons and list of restaurants on the landing page. As well as which of the counties and cities is currently active.

```js
const country = req.query.country
const city = req.query.city
const countries = []
for (const country in locations) {
  countries.push(country)
}
let cities = []
let restaurants = []
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
```
This along with a modifcation of the CSS used on the radio buttons show the average score of all ratings. First we get the total of all the scores so far. Then the number of ratings. Then divides the score by the number of ratings. Then uses `Math.floor` to show a whole number for the number of stars.
```ejs
<% const total = restaurant.ratings.reduce((accumulator, rating) => accumulator + rating.score, 0,) %>
<% const length = restaurant.ratings.length %>
<% const average = total/length || 0 %>
<% const roundedScore = Math.floor(average) %>
```
I tried to find a solution to how to remove the ratings left by the users when the user is deleted but couldn't find this out. Joe showed me how I could filter the ratings in order to remove any ratings left by the user being deleted.
```js
router.delete('/profile', isSignedIn, async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ 'ratings.user': req.session.user._id })

    for (let restaurant of restaurants) {
      restaurant.ratings = restaurant.ratings.filter(rating => !rating.user.equals(req.session.user._id))
      await restaurant.save()
    } 

    const userInDatabase = await User.findOne({ username: req.body.username })

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
```

## Challenges

* The amount of work was very challenging. Getting everything I planned done took a lot longer than I thought
* A very complicated query string setup took a long time to work out and a lot of iteration.
* Showing the stars was tricky but I found a good solution using CSS and SVGs
* I used Stackoverflow to find many answers to small problems I had, including the ratings stars
* This project is focused on EJS

## Wins

* Calculating the average rating
* Implementing the authentication following the labs
* Implementing image upload following the labs
* Finding a way to show stars using SVGs
* Design: I am pleased with the way the landing page worked out using query strings to show restaurants
* Design: I am pleased with the way the forms look
* Joe helped me with the delete rating for deleted user
* Joe found solution to deployment issue a lot of us had with Netlify and MongoDB

## Key Learnings/Takeaways

This was my first big introduction to backend work. Learning about setting up authentication, partials, API calls, databases, seeding and deploying to Netlify.

## Bugs

No known bugs. Just a few areas where error handling doesn't show a message but redirects using `res.send`. 

## Future Improvements

* As AAAU I want to be able to upload pictures to a gallery
* As AAAU I want to be able to bookmark my favourite restaurants
* As AAAU I want to be able to see a list of my favourite restaurants in my profile
* As AAAU (admin) I want to be able to reply to comments
* As AAAU (admin) I want to be able to add a new country and city

## Attributions

* svgrepo.com for Star SVG