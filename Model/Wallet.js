const mongo = require("mongoose");

const walletSchema = new mongo.Schema({
  UserID: {
    type: mongo.Types.ObjectId,
    require,
  },
  transaction: {
    type: [Object],
  },
  Amount: {
    type: Number,
  },
});
const wallet = mongo.model("wallet", walletSchema);

module.exports = wallet;
