const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
const hbs = require("hbs");
const session = require("express-session");
const methodOverride = require("method-override");
const fs = require('fs')
const flash = require('connect-flash')
const morgan = require('morgan')
const errorHandler = require("./middleware/errorHandler");
const erro404 = require("./middleware/page404");
const helmet=require('helmet')
const { isEqual, increment, calculatePersatage, lookupQuantity, sumStock, stockWarning, isZero, dateFormater, isArrayEmpty, isStringsEqual } = require("./utils/hbsHelpers");
const database = require("./model/connection");



dotenv.config({ path: "./configaration.env" });


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs")
app.set("view cache", false);
hbs.registerPartials(path.join(__dirname, "views/partials"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const logsDir = path.join(__dirname, "logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, "access.log"),
  { flags: "a" }
);
app.set("trust proxy", 2);
app.use(
  morgan("[:date[iso]] :remote-addr :method :url :status :res[content-length] B :response-time ms", {
    skip: (req) => {
      return /\.(css|js|jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot|map)$/i.test(req.url);
    },
  }),

);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(methodOverride("_method"))
app.use(flash())
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
(() => {
  const isExist = fs.existsSync('uploads')
  if (!isExist) {
    fs.mkdir('uploads', () => { })
  }

})()

app.use("/user", require("./router/user"));
app.use("/admin", require("./router/admin"));



app.use(express.static(path.join(__dirname, "public")));



///helper
hbs.registerHelper("isEqual", isEqual);
hbs.registerHelper("increment", increment)
hbs.registerHelper("calculatePersatage", calculatePersatage);
hbs.registerHelper('lookupQuantity', lookupQuantity);
hbs.registerHelper('sumStock', sumStock)
hbs.registerHelper('stockWarning', stockWarning)
hbs.registerHelper('isZero', isZero)
hbs.registerHelper('formatHelper', dateFormater)
hbs.registerHelper('isArrayEmpty', isArrayEmpty)
hbs.registerHelper('stringEqualityChecker', isStringsEqual)


app.get('/api', (req, res) => {
  res.send('server')
})
app.use(erro404);

app.use(errorHandler);
app.listen(process.env.PORT, () => console.log(`server is running on http://localhost:${process.env.PORT}`))
module.exports = app