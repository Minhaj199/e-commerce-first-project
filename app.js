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

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { Expires: 3600000 },
  })
);

app.use(require("./middleware/cacheControl"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'))



app.get("/", async (req, res) => {
  res.redirect("/user");
});

// routes require
dotenv.config({ path: "./configaration.env" });

app.use(methodOverride("_method"))

app.use("/user", require("./router/user"));
app.use("/admin", require("./router/admin"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.set("view cache", false);
app.use(express.static(path.join(__dirname, "public")));

///partials

hbs.registerPartials("views/partials");
hbs.registerPartials("views/partials");
hbs.registerPartials("vies/partials");
hbs.registerPartials("vies/partials");

///helper
hbs.registerHelper("isEqual", function (value1, value2, options) {
  return value1 === value2 ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper("increment", function (value) {
  return value + 1;
});
hbs.registerHelper("calculatePersatage", function (value1, value2) {
  let persantage = parseInt(value1);
  let amount = parseInt(value2);
  if (isNaN(value1) || isNaN(value2)) {
    return "";
  }
  const sample = persantage / 100;
  const discount = sample * amount;
  const preResult = value2 - discount;
  const result = Math.floor(preResult);
  return result;
});

app.use(erro404);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`connected to port ${PORT}`);
});
