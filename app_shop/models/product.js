const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  prime_price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  num_purch: {
    type: Number,
    required: false,
  },
  num_deletions: {
    type: Number,
    required: false,
  },
  date_add:{
    type: Date,
    required: false,
  },
  date_purch: {
    type: Date,
    required: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Product", productSchema);

