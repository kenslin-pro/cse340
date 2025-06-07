// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require ("../controllers/accountController")

router.post('/register', accountController.handleRegister);
router.post('/register', utilities.handleErrors(accountController.registerAccount))
// Route for login
router.get('/login', accountController.buildLogin);


// Route for registration
router.get('/register', accountController.buildRegister);

// Middleware for errors
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something were wrong in the account.');
  });

  module.exports = router;