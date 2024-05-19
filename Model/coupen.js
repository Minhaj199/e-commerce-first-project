const mongo = require("mongoose");

const coupenSchema = new mongo.Schema({
  code: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  Expiry: {
    type: Date,
  },
  amount: {
    type: Number,
  },
});

const coupen = new mongo.model("coupen", coupenSchema);

module.exports = coupen;
