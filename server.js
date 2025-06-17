/* ******************************************
 * Primary server.js file to control the app
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
require("dotenv").config()
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const session = require("express-session")
const pool = require('./database/')
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const flash = require("connect-flash")
const pgSession = require("connect-pg-simple")(session)

const staticRoutes = require("./routes/static")
const errorRoutes = require("./routes/errorRoute")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities")

/* ***********************
 * App Initialization
 *************************/
const app = express()

/* ***********************
 * Middleware Setup
 *************************/

// Session setup
app.use(session({
  store: new pgSession({
    pool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: "sessionId",
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    secure: false, // Set true if using HTTPS
    httpOnly: true
  }
}))

// Flash messages
app.use(flash())

// Messages middleware
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res)
  next()
})

// Parsers
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

// Request logger (useful for development)
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`)
  next()
})

// Check session-based login
app.use(utilities.checkJWTToken) // Optional if you want to support JWT — else remove

// Serve static files
app.use(express.static("public"))

/* ***********************
 * View Engine Setup
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes)
app.use("/inv", require("./routes/inventoryRoute"))
app.use("/account", require("./routes/accountRoute"))

// Home route
app.get("/", utilities.handleErrors(baseController.buildHome))

/* ****************************************
 * Error Middleware (last)
 **************************************** */
app.use(errorRoutes)

/* ***********************
 * Server Listener
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`)
})
