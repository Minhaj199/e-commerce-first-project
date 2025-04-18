const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
const hbs = require("hbs");
const session = require("express-session");
const methodOverride = require("method-override");
const morgan=require('morgan')

const errorHandler = require("./middleware/errorHandler");
const erro404 = require("./middleware/page404");
const productItemModel = require("./Model/prouctItems");
const { Types } = require("mongoose");
const { isEqual, increment, calculatePersatage, lookupQuantity, sumStock, stockWarning, isZero } = require("./utils/hbsHelpers");



dotenv.config({ path: "./configaration.env" });


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs")
app.set("view cache", false);
// hbs.registerPartials("views/partials");
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


// app.use(morgan('dev'))



app.get("/", async (req, res) => {
  try {
   
    res.redirect("/user");
  } catch (error) {
    
  }
});


// routes require



app.use("/user", require("./router/user"));
app.use("/admin", require("./router/admin"));
app.get('/sample',async(req,res)=>{
  
  res.render('sample')
})


app.use(express.static(path.join(__dirname, "public")));

///partials


// hbs.registerPartials("views/partials");
// hbs.registerPartials("views/partials");
// hbs.registerPartials("views/partials");
// hbs.registerPartials("views/partials");

///helper
hbs.registerHelper("isEqual",isEqual);
hbs.registerHelper("increment",increment)
hbs.registerHelper("calculatePersatage",calculatePersatage);
hbs.registerHelper('lookupQuantity',lookupQuantity);
hbs.registerHelper('sumStock',sumStock)
hbs.registerHelper('stockWarning',stockWarning)
hbs.registerHelper('isZero',isZero)
app.use(erro404);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`connected to port ${PORT}`);
});
