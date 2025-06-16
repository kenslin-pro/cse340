const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// Login and Register Views
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Registration and Login POST
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkloginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Logged-in Account Dashboard
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.accountDefault)
)

// Update Account and Password
router.get("/update/:accountId", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount))
router.post(
  "/update", 
  utilities.checkLogin,
  regValidate.updateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)
router.post(
  "/updatePassword",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkUpdatePasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

// Logout
router.get("/logout", utilities.handleErrors(accountController.logout))

// My Reviews Page
router.get("/reviews/:accountId", utilities.checkLogin, utilities.handleErrors(accountController.buildReviewsPage))

module.exports = router
