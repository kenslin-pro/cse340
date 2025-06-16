const utilities = require(".")
const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model");
const { body, validationResult } = require("express-validator")
const validate = {}

validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isAlphanumeric()
      .isLength({ min: 10 })
      .withMessage("Classification name must be at least 10 characters long and contain only letters and numbers.")
  ]
}

validate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name
    })
    return
  }
  next()
}

validate.inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("Car Brand must contain only letters."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .matches(/^[A-Za-z0-9\s]+$/)
      .withMessage("Car Model must contain only letters and numbers."),

    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .isLength({ min: 4 })
      .withMessage("Car Year must be exactly 4 digits."),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ max: 2000 })
      .withMessage("Description is required."),

    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Price must be a non-negative integer."),

    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Miles must be a non-negative integer."),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("Car Color must contain only letters."),

    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .custom(async (classification_id) => {
        const classificationExists = await invModel.checkExistingClassification(classification_id)
        if (!classificationExists) {
          throw new Error("Email exists. Please log in or use different email")
        }
      })
      .withMessage("Classification must exist."),
  ]
}

validate.newInventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("Car Brand must contain only letters."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .matches(/^[A-Za-z0-9\s]+$/)
      .withMessage("Car Model must contain only letters and numbers."),

    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .isLength({ min: 4 })
      .withMessage("Car Year must be exactly 4 digits."),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ max: 2000 })
      .withMessage("Description is required."),

    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Price must be a non-negative integer."),

    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Miles must be a non-negative integer."),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("Car Color must contain only letters."),

    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .custom(async (classification_id) => {
        const classificationExists = await invModel.checkExistingClassification(classification_id)
        if (!classificationExists) {
          throw new Error("Classification does not exist.")
        }
      })
      .withMessage("Classification must exist."),

    body("inv_id")
      .trim()
      .escape()
      .notEmpty()
      .custom(async (inv_id) => {
        const inventoryExists = await invModel.getInventoryDetails(inv_id)
        if (!inventoryExists) {
          throw new Error("Inventory does not exist.")
        }
      })
      .withMessage("Inventory must exist."),
  ]
}

validate.checkInventoryData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
    })
    return
  }
  next()
}

validate.checkUpdateData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, inv_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    let nav = await utilities.getNav()
    res.render("inventory/edit", {
      errors,
      title: "Edit " + inv_make + " " + inv_model,
      nav,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_id,
    })
    return
  }
  next()
}

module.exports = validate;