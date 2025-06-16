const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null
  })
}

invCont.buildByInvId = async (req, res, next) => {
  const inventory_id = req.params.invId;
  const data = await invModel.getInventoryDetails(inventory_id);
  const reviews = await reviewModel.getReviewsByInvId(inventory_id)
  const content = await utilities.buildDetailsView(data)
  const reviewContent = await utilities.buildReviews(reviews, res.locals.accountData ? res.locals.accountData.account_id : null)
  let nav = await utilities.getNav();
  res.render("./inventory/details", {
    title: data.inv_make,
    nav,
    content,
    reviewContent,
    review_text: "",
    inventory_id,
    account_id: res.locals.accountData ? res.locals.accountData.account_id : null,
    loggedin: res.locals.loggedin,
    errors: null
  })
}

invCont.management = async (req, res, next) => {
  let nav = await utilities.getNav();
  const select = await utilities.renderSelect()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    select
  })
}

invCont.addClassification = async (req, res, next) => {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  })
}

invCont.newClassification = async (req, res) => {
  const { classification_name } = req.body

  const classResult = await invModel.newClassification(
    classification_name
  )

  let nav = await utilities.getNav()

  if (classResult) {
    req.flash(
      "notice",
      `${classification_name} added successfully!`
    )
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the addition of a new Classification failed.")
    res.status(501).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null
    })
  }
}

invCont.buildAddInventory = async (req, res, next) => {
  let nav = await utilities.getNav();
  let select = await utilities.renderSelect()
  res.render("./inventory/add-inventory", {
    title: "Add New Car",
    nav,
    errors: null,
    select
  })
}

invCont.newInventory = async (req, res) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id } = req.body

  const invResult = await invModel.newInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )

  let nav = await utilities.getNav()

  if (invResult) {
    req.flash(
      "notice",
      `Vehicle added successfully!`
    )
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the addition of a new Vehicle failed.")
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Car",
      nav,
      errors: null
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

invCont.editInventory = async (req, res, next) => {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryDetails(inv_id)
  const classificationSelect = await utilities.renderSelect(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit", {
    title: "Edit " + itemName,
    nav,
    select: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  console.log(req.body)
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.renderSelect(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("./inventory/edit", {
      title: "Edit " + itemName,
      nav,
      select: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Build Delete Inventory view
 * ************************** */
invCont.buildDeleteInventory = async (req, res, next) => {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryDetails(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const invId = parseInt(req.body.inv_id)
  const updateResult = await invModel.deleteInventory(invId)
  const itemName = req.body.inv_make + " " + req.body.inv_model

  if (updateResult) {
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } else {

    req.flash("notice", "Sorry, the deletion failed.")
    res.status(501).render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: req.body.inv_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_price: req.body.inv_price,
    })
  }
}

module.exports = invCont