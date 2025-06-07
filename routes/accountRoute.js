const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index.js");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

console.log("in accountRoute.js");

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccount)
);
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);
router.get("/logout", utilities.handleErrors(accountController.accountLogout));
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);
// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

router.get(
  "/admin",
  utilities.checkLogin,
  utilities.checkOwnership,
  utilities.handleErrors(accountController.buildAdminPanel)
);

router.post(
  "/admin",
  utilities.checkLogin,
  utilities.checkOwnership,
  (req, res, next) => {
    console.log("Processing bulk update", req.body);
    next();
  },
  regValidate.adminUpdateRules(),
  regValidate.checkadminUpdate,
  utilities.handleErrors(accountController.processAdminBulkUpdate)
);

router.get(
  "/edit/:accountId",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildEditAccount)
);

router.post(
  "/update",
  utilities.checkLogin,
  regValidate.editAccountRules(),
  regValidate.checkAccountData,
  utilities.handleErrors(accountController.updateAccountInfo)
);

router.post(
  "/update/password",
  utilities.checkLogin,
  regValidate.accountPasswordRules(),
  regValidate.checkAccountPassword,
  utilities.handleErrors(accountController.updateAccountPassword)
);

module.exports = router;

