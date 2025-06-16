const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    errors: null,
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    return res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    return res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600000 })
      const cookieOptions = { httpOnly: true, maxAge: 3600000 }
      if (process.env.NODE_ENV !== 'development') cookieOptions.secure = true
      res.cookie("jwt", accessToken, cookieOptions)
      return res.redirect("/account")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

/* ****************************************
 *  Account dashboard
 * ************************************ */
async function accountDefault(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/", {
    title: "You're logged in",
    nav,
    errors: null
  })
}

/* ****************************************
 *  Build update account view
 * ************************************ */
async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav()
  const accountId = req.params.accountId
  const accountData = await accountModel.getAccountById(accountId)

  if (!accountData) {
    req.flash("notice", "Sorry, the account could not be found.")
    return res.status(404).render("account/", {
      title: "Account Not Found",
      nav,
      errors: null,
    })
  }

  const { account_firstname, account_lastname, account_email } = accountData

  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname,
    account_lastname,
    account_email,
    account_id: accountId,
  })
}

/* ****************************************
 *  Update account details
 * ************************************ */
const updateAccount = async (req, res) => {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)

  if (updateResult) {
    req.flash("notice", "Your account has been updated.")
    return res.status(200).render("account/", {
      title: "Account Updated",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the update failed.")
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
 *  Update account password
 * ************************************ */
const updatePassword = async (req, res) => {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "There was an error updating your password.")
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id
    })
  }

  const passwordUpdate = await accountModel.passwordUpdate(account_id, hashedPassword)

  if (passwordUpdate) {
    req.flash("notice", "Your password has been updated.")
    return res.status(200).render("account/", {
      title: "Account Updated",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the update failed.")
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id
    })
  }
}

/* ****************************************
 *  Deliver My Reviews View ✅ FIXED
 * *************************************** */
async function buildReviewsPage(req, res) {
  let nav = await utilities.getNav()
  const accountId = res.locals.accountData.account_id

  try {
    const reviews = await accountModel.getReviewsByAccountId(accountId)
    const reviewContent = await utilities.buildReviews(reviews, accountId) // ✅ FIXED variable name

    res.render("account/reviews", {
      title: "My Reviews",
      nav,
      errors: null,
      reviewContent, // ✅ Matches your EJS
    })
  } catch (error) {
    req.flash("notice", "Sorry, we couldn't load your reviews.")
    return res.status(500).render("account/", {
      title: "Account",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Logout
 * ************************************ */
const logout = async (req, res) => {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
}

/* ****************************************
 *  Exports
 * ************************************ */
module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  accountDefault,
  buildUpdateAccount,
  updateAccount,
  updatePassword,
  logout,
  buildReviewsPage,
}
