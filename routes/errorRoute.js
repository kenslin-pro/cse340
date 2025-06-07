const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/index.js")
const errorController = require("../controllers/errorController")



// File Not Found Route - must be last route in list.
router.use(utilities.handleErrors(async (req,res, next) => {
    const {status, message } = await errorController.BuildByErrorCode(req)
    next({status: status,
       message: message
      })

  }))
  
  /* ***********************
  * Express Error Handler
  * Place after all other middleware
  *************************/
  router.use(async (err, req, res, next) => {
    
    let nav = await utilities.getNav()
    console.error(`Error at: "${req.originalUrl}": ${err.message}`)
    // if(err.status == 404) {message = err.message} else {message = "Sorry for driving you crazy! Something isn't right!"}
    res.render("errors/error", {
      title: err.status || 'Server Error',
      message: err.message,
      nav
    })
  })

  module.exports = router