const mongo = require("mongoose");

const offerSchema = new mongo.Schema({
  Title: {
    type: String,
  },
  category: {
    type: String,
  },
  rate: {
    type: Number,
  },
  status: {
    type: Boolean,
    default: true,
  },
  ProductIDs: [{ type: mongo.Types.ObjectId, ref: "Product_items" }],
});

const offer = new mongo.model("offer", offerSchema);
module.exports = offer;
