const inventoryModel = require("../models/inventory-model")
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}


/*  **********************************
  *  Inventory Data Validation Rules
  * ********************************* */

validate.addClassRules = () => {
    return [
        // class_name is required and must have no leading or trailing spaces and no special characters of any kind
    body("classification_name")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 3 })
    .isAlphanumeric()
    .withMessage("Please provide a valid classification name.")
.custom(async (classification_name) => {
  const classExists = await inventoryModel.checkExistingClass(classification_name)
  if (classExists.rowCount){
    throw new Error("Classification already exists. Please enter a different classification name.")
  }
})
    ]
}

validate.addInvRules = () => {
console.log("in addInvRules")
    return [
        // class_name is required and must have no leading or trailing spaces and no special characters of any kind
    body("classification_id")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("The selected classification name cannot be used or was not selected."),
    // inv_make is required and length > 3, no special characters
    body("inv_make")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 3 })
    .isAlphanumeric()
    .withMessage("The vehicle make is not the appropriate value."),
    // inv_model is required and length > 3, no special characters
    body("inv_model")
    .trim()
    .escape()
    .notEmpty()
    .isLength({min:3})
    .matches(/^[a-zA-Z0-9 ]+$/)
    // .isAlphanumeric()
    .withMessage("The vehicle model is not the appropriate value."),
    // inv_year must be four digits
    body("inv_year")
    .trim()
    .escape()
    .notEmpty()
    .isNumeric()
    .isLength({min:4, max:4})
    .withMessage("The vehicle year is not the appropriate value."),
    // inv_description, trim, escape, not empty, 
    body("inv_description")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("The vehicle description is not the appropriate value."),
    // Image path must be '/images/vehicles/*.mime, no https, no http, no special characters except for / and .
    body("inv_image")
    .trim()
    .notEmpty()
    .matches(/^\/images\/vehicles\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png)$/)
    .withMessage("The vehicle image path is not the appropriate value."),
    // inv_thumbnail, trim, escape, not empty,
    body("inv_thumbnail")
    .trim()
    .notEmpty()
    .matches(/^\/images\/vehicles\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png)$/)
    .withMessage("The vehicle thumbnail is not the appropriate value."),
    // inv_price, trim, escape, not empty, numeric, no commas, no special characters
    body("inv_price")
    .trim()
    .escape()
    .notEmpty()
    .isNumeric()
    // .isCurrency()
    .withMessage("The vehicle price is not the appropriate value."),
    // inv_miles, trim, escape, not empty, numeric, no commas, no special characters
    body("inv_miles")
    .trim()
    .escape()
    .notEmpty()
    .isNumeric()
    .withMessage("The vehicle miles is not the appropriate value."),
    // inv_color, trim, escape, not empty, no special characters, no numbers
    body("inv_color")
    .trim()
    .escape()
    .notEmpty()
    .isAlpha()
    .withMessage("The vehicle color is not the appropriate value."),
    ]
}


  /* ******************************
 * Check data and return errors or continue to add
 * ***************************** */

validate.checkAddClassData = async (req, res, next) => {
    console.log("in checkAddClassData")
const {classification_name} = req.body
let errors = []
errors = validationResult(req)
console.log("errors", errors)
if(!errors.isEmpty()){
    let nav = await utilities.getNav()
    res.render("inventory/add-classification",{
        errors,
        title: "Add New Classification",
        nav,
        classification_name
    })
    return
}
next()
}



  /* ******************************
 * Check inventory data and return errors or continue to add
 * ***************************** */
validate.checkAddInvData = async (req, res, next) => {
    console.log("in checkAddInvData")
    const {classification_id, inv_make, inv_model, inv_year, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color} = req.body 
    let errors = []
    errors = validationResult(req)
    console.log("errors", errors)
    if(!errors.isEmpty()){
        let nav = await utilities.getNav()
        let classDrop = await utilities.buildClassificationDropdown()
        res.render("inventory/add-inventory.ejs",{
            errors,
            title: "Add New Inventory",
            nav,
            classDrop,
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color
        })
        return
    }
    next()
    }



  /* ******************************
 * Check inventory data updates and return errors or continue to add
 * ***************************** */
    validate.checkUpdateData = async (req, res, next) => {
        console.log("in checkAddInvData")
        const {inv_id, classification_id, inv_make, inv_model, inv_year, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color} = req.body 
        const itemName = `${inv_make} ${inv_model}`
        let errors = []
        errors = validationResult(req)
        console.log("errors", errors)
        if(!errors.isEmpty()){
            let nav = await utilities.getNav()
            let classDrop = await utilities.buildClassificationDropdown()
            res.render("inventory/edit-inventory.ejs",{
                errors,
                title: `Edit ${itemName} Inventory`,
                nav,
                classDrop,
                classification_id,
                inv_make,
                inv_model,
                inv_year,
                inv_image,
                inv_thumbnail,
                inv_price,
                inv_miles,
                inv_color,
                
            })
            return
        }
        next()
        }


        

module.exports = validate