const utilities = require(".")
const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model");
const reviewModel = require("../models/review-model")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.newReviewRules = () => {
  return [
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Review must be at least 10 characters long."),

    body("inv_id")
      .trim()
      .escape()
      .notEmpty()
      .custom(async (inv_id) => {
        const inventoryExists = await invModel.getInventoryDetails(inv_id)
        if (!inventoryExists) {
          throw new Error("Failed to retrieve inventory.")
        }
      })
      .withMessage("Failed to retrieve inventory."),

    body("account_id")
      .trim()
      .escape()
      .notEmpty()
      .custom(async (account_id) => {
        const accountExists = await accountModel.getAccountById(account_id)
        if (!accountExists) {
          throw new Error("You must be logged in to leave a review.")
        }
      })
      .withMessage("You must be logged in to leave a review."),
  ]
}

validate.checkReviewData = async (req, res, next) => {
  const { review_text, inv_id, account_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    const data = await invModel.getInventoryDetails(inv_id);
    const reviews = await reviewModel.getReviewsByInvId(inv_id)
    const content = await utilities.buildDetailsView(data)
    const reviewContent = await utilities.buildReviews(reviews, account_id)
    let nav = await utilities.getNav()
    res.render("inventory/details", {
      errors,
      title: data.inv_make,
      nav,
      content,
      reviewContent,
      review_text,
      inventory_id: inv_id,
      loggedin: res.locals.loggedin,
      account_id,
    })
    return
  }
  next()
}

validate.newReviewRules = () => {
  return [
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Review must be at least 10 characters long."),

    body("review_id")
      .trim()
      .escape()
      .notEmpty()
      .custom(async (review_id) => {
        const reviewExists = await reviewModel.getReviewsByReviewId(review_id)
        if (!reviewExists) {
          throw new Error("Review does not exist.")
        }
      })
      .withMessage("Review does not exist."),
  ]
}

validate.checkUpdateReviewData = async (req, res, next) => {
  const { review_text, review_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    let nav = await utilities.getNav()
    res.render("inventory/edit-review", {
      errors,
      title: "Edit Review",
      nav,
      review_text,
      review_id,
    })
    return
  }
  next()
}

module.exports = validate;