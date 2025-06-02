const mongo = require("mongoose");

const categoryANGbrandSchema = new mongo.Schema({
  category: {
    type: [String],
  },
  brand: {
    type: [String],
  },
});

const Category = mongo.model("category/brand", categoryANGbrandSchema);
module.exports = Category;
