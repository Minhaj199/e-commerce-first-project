const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
const hbs = require("hbs");
const session = require("express-session");
const methodOverride = require("method-override");
const fs=require('fs')

const errorHandler = require("./middleware/errorHandler");
const erro404 = require("./middleware/page404");

const { isEqual, increment, calculatePersatage, lookupQuantity, sumStock, stockWarning, isZero, dateFormater, isArrayEmpty, isStringsEqual } = require("./utils/hbsHelpers");
const database = require("./model/connection");



dotenv.config({ path: "./configaration.env" });


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs")
app.set("view cache", false);

hbs.registerPartials(path.join(__dirname, "views/partials"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride("_method"))
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { Expires: 3600000 },
  })
);




app.use(require("./middleware/cacheControl"));




//////////database/////////
try {
  database()
  
} catch (error) {
  process.exit(1)
}


app.get("/", async (req, res) => {
  try {
   
    res.redirect("/user");
  } catch (error) {
    
  }
});


// routes require

///////////checkin upload folder exitest and create//////////
(()=>{
  const isExist=fs.existsSync('uploads')
  if(!isExist){
    fs.mkdir('uploads',()=>{})
  }

})()

app.use("/user", require("./router/user"));
app.use("/admin", require("./router/admin"));



app.use(express.static(path.join(__dirname, "public")));



///helper
hbs.registerHelper("isEqual",isEqual);
hbs.registerHelper("increment",increment)
hbs.registerHelper("calculatePersatage",calculatePersatage);
hbs.registerHelper('lookupQuantity',lookupQuantity);
hbs.registerHelper('sumStock',sumStock)
hbs.registerHelper('stockWarning',stockWarning)
hbs.registerHelper('isZero',isZero)
hbs.registerHelper('formatHelper',dateFormater)
hbs.registerHelper('isArrayEmpty',isArrayEmpty)
hbs.registerHelper('stringEqualityChecker',isStringsEqual)

app.use(erro404);

app.use(errorHandler);
app.listen(process.env.PORT,()=>console.log(`server is running on http://localhost:${process.env.PORT}`))
module.exports=app