
/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
require("dotenv").config();
// console.log("DATABASE_URL:", process.env.DATABASE_URL); // Check if URL is loading
const express = require("express")
const expressLayouts = require("express-ejs-layouts")

const app = express()
const session = require("express-session")
const pool = require('./database/')
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")


const static = require("./routes/static")

const catchErrorsRoute = require("./routes/errorRoute.js")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/index.js")


console.log("DATABASE_URL:", process.env.DATABASE_URL); // Check if URL is loading
/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})


app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended: true}))// for parsing application/x-www-form-urlencoded

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(cookieParser())

app.use(utilities.checkJWTToken)



/* ***********************
 * View Engine and Templates
 *************************/

app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root - sets layout filespace

/* ***********************
 * Routes
 *************************/

app.use(static)
// app.use((req,res,next) => {console.log("incoming route url: ", req.url)})

app.get("/", utilities.handleErrors(baseController.buildHome))

app.use("/inv", require("./routes/inventoryRoute.js"))

app.use("/account", require("./routes/accountRoute.js"))

// app.get("/", utilities.handleErrors((req,res) => 
//   {res.render("index", {title: "Home"})}
// ))

/* ****************************************
 * Middleware For Handling Errors
 * Do not place anything after this.
 * wrap utilities.handleErrors for General Error Handling
 **************************************** */
app.use(catchErrorsRoute);

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST


/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
