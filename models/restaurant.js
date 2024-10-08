const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  score: { type: Number, required: true },
  comment: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
})

const restaurantSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: [ratingSchema]
  }, {
    timestamps: true
  });
  
  const Restaurant = mongoose.model("Restaurant", restaurantSchema);
  
  module.exports = Restaurant;
