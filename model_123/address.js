const mongo = require("mongoose");

const addressSchema = new mongo.Schema({
  UserId: {
    type: mongo.Types.ObjectId,
  },
  Name: {
    type: String,
    require: true,
  },
  Mobile: {
    type: String,
  },
  Aleternative_mobile: {
    type: String,
  },
  Pin: {
    type: String,
  },
  Town: {
    type: String,
  },
  Email: {
    type: String,
  },
  Locality: {
    type: String,
  },
  Land_mark: {
    type: String,
  },
  Address: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  status: {
    type: Boolean,
    default: true,
  },
});
const AddressModel = new mongo.model("address", addressSchema);
module.exports = AddressModel;
