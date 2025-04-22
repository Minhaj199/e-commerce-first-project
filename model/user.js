const mongo = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./configaration.env" });


const db = process.env.DB_STRING


mongo.connect(db).then(() => {
  console.log('connected')
});


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
