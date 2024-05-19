const mongo = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./configaration.env" });

const wishListChema = new mongo.Schema({
  UserID: {
    type: mongo.Types.ObjectId,
    require,
  },
  ProductID: {
    type: mongo.Types.ObjectId,
    require,
  },
  color: {
    type: String,
  },
  size: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  price: {
    type: Number,
  },
  total: {
    type: Number,
  },
});
const wishlist = new mongo.model("wishlist", wishListChema);
module.exports = wishlist;
