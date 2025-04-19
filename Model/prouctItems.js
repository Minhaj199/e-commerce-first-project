const mongo = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./configaration.env" });



const productsSchema = new mongo.Schema({
  Name: {
    type: String,
    require: true,
    unique: true,
  },
  brand: {
    type: String,
    require: true,
  },
  category: {
    type: String,
    require: true,
  },
  variants:[{size:String,color:String,stock:Number}],
  price: {
    type: Number,
    require:true
  },
  description: {
    type: String,
  },
  offer_rate: {
    type: Number,
  },
  statuse: {
    type: Boolean,
    default: true,
  },
  images: {
    path: [String],
  },
  deleteStatus:{type:Boolean,default:false}
});
const productItemModel = new mongo.model("Product_items", productsSchema);

module.exports = productItemModel;
