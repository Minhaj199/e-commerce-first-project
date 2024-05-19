const mongo = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./configaration.env" });

const db = process.env.DB_STRING;

mongo.connect(db).then(() => {});

const productsSchema = new mongo.Schema({
  Name: {
    type: String,
    require: true,
    unique: true,
  },
  brand: {
    type: String,
    require: true,
  },
  category: {
    type: String,
    require: true,
  },
  sizes: {
    small: {
      white: Number,
      red: Number,
      black: Number,
    },
    medium: {
      white: Number,
      black: Number,
      red: Number,
    },
    large: {
      white: Number,
      black: Number,
      red: Number,
    },
  },
  price: {
    type: Number,
  },
  description: {
    type: String,
  },
  offer_rate: {
    type: Number,
  },
  statuse: {
    type: Boolean,
    default: true,
  },
  images: {
    path: [String],
  },
});
const productModel = new mongo.model("Products", productsSchema);

module.exports = productModel;
