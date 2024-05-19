const mongo = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./configaration.env" });



// const db = process.env.DB_STRING;
// const db =
 const db= "mongodb+srv://minhajpuzhakkal:Minhaj12315%40@mfashion.qgkekxv.mongodb.net/?retryWrites=true&w=majority&appName=mfashion";

mongo.connect(db).then(() => {});

const userScheme = new mongo.Schema({
  first_name: {
    type: String,
    required: true,
  },
  second_name: {
    type: String,
    require: true,
  },
  Email: {
    type: String,
    require: true,
  },
  phone_Number: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
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

const user = new mongo.model("users", userScheme);

module.exports = user;
