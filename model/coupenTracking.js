const mongo = require("mongoose");

const trackingSchema = new mongo.Schema({
  UserID: {
    type: mongo.Types.ObjectId,
  },
  CoupenID: {
    type: mongo.Types.ObjectId,
  },
});

const tracking = new mongo.model("coupenTracking", trackingSchema);
module.exports = tracking;
