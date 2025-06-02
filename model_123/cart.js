const mongo = require("mongoose");

const cartScheme = new mongo.Schema({
  ProductId: {
    type: mongo.Types.ObjectId,
  },
  UserId: {
    type: mongo.Types.ObjectId,
  },
  OrderQuantity: {
    type: Number,
  },
  name:String,
  OrderPrice: {
    type: Number,
  },
  Size: {
    type: String,
  },
  Color: {
    type: String,
  },
  Total: {
    type: Number,
  },
  status: {
    type: Boolean,
    default: true,
  },

  CreatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const cart = new mongo.model("cart", cartScheme);

module.exports = cart;
