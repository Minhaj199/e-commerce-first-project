const mongo = require("mongoose");

const coupenSchema = new mongo.Schema({
  name:{
    type:String,
    unique:true
  },
  code: {
    type: String,
    unique: true,
  },
  startingDate: {
    type: Date,
  },
  expiry: {
    type: Date,
  },
  amount: {
    type: Number,
  },
});

const coupen = new mongo.model("coupen", coupenSchema);

module.exports = coupen;
