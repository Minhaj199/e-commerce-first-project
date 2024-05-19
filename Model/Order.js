const mongo = require("mongoose");

const orderSchema = new mongo.Schema({
  UserId: {
    type: mongo.Types.ObjectId,
    require,
  },
  PaymentOption: {
    type: String,
    require,
  },
  AddressID: {
    type: mongo.Types.ObjectId,
    require,
  },
  SubTotal: {
    type: Number,
    require,
  },
  Order: {
    type: Array,
  },
  Discount: {
    type: Number,
  },

  ShippingCharge: {
    type: Number,
  },
  TotalOrderPrice: {
    type: Number,
    require,
  },

  OrderPlacedDate: {
    type: Date,
    default: Date.now(),
  },
  coupenID: {
    type: mongo.Types.ObjectId,
  },
  numberOfOrders: {
    type: Number,
  },
});
const Order = new mongo.model("Order", orderSchema);
module.exports = Order;
