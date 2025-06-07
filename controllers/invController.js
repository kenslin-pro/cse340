const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

// if no data, skip this controller, to be moved into higher order function.
function skipControllerIfBlankResult(data, next){
    if (!data || data.length === 0) {      
    return next() 
}}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    console.log("in buildByClassificationId")
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  skipControllerIfBlankResult(data, next)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.buildByInventoryId = async function (req, res, next) {
    console.log('in buildByInventoryId')
    const inventory_id = req.params.inventoryId     
    const data = await invModel.getInventoryByInventoryId(inventory_id)
    // if no data, skip this controller
    skipControllerIfBlankResult(data, next)
    const vehicle = data[0]
    const grid = await utilities.buildInventoryGrid(data)
    let nav = await utilities.getNav()

    const className = `${vehicle.inv_year} ${vehicle.inv_model} ${vehicle.inv_make}`
    res.render('./inventory/details.ejs', {
        title: className,
        nav,
        grid,
    })
}



invCont.buildVehicleManager = async function (req,res, next) {
  // console.log('in buildVehicleManager')
  let nav = await utilities.getNav()
  classDrop = await utilities.buildClassificationDropdown()
  res.render("./inventory/managment.ejs", {
    title: 'Vehicle Management',
    nav,
    classDrop,
  })

}
 
  invCont.buildAddClass =  async function (req,res, next) {
    console.log('in buildAddClass')
    // const {classification_name} = req.body
    let nav = await utilities.getNav()
    // const data = await invModel.addInventoryClassByName(classification_name)
    res.render("./inventory/add-classification.ejs", {
      title: 'Add New Classification',
      nav,
      errors: null,
})
}

invCont.buildAddInv =  async function (req,res, next) {
  let nav = await utilities.getNav()
  let classDrop = await utilities.buildClassificationDropdown()
  res.render("./inventory/add-inventory.ejs", {
    title: 'Add New Inventory',
    nav,
    errors: null,
    classDrop
  })
}

/* ****************************************
*  Process Inventory
* *************************************** */
// Reminder to self: next isn't needed because pass or failure is handled!
invCont.addClass = async function(req,res){
  // console.log('in addClass')
  const {classification_name} = req.body;
  const addResult = await invModel.addInventoryClassByName(classification_name)
  
  if (addResult){
    let nav = await utilities.getNav()
    req.flash('notice',`You're classification '${classification_name}' has been added to the system.`)
    res.status(201).render("inventory/managment.ejs", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })
  } else {
    let nav = await utilities.getNav()
    req.flash('notice', `The classification '${classification_name}' could not be added. Please try again later.`)
    res.status(501).render("inventory/managment.ejs",{
      title:"Add New Classification",
      nav,
      errors: null,
    })
  }
}

invCont.addInv = async function(req,res){
  console.log('in addClass')
  const {classification_id,inv_make,inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color} = req.body;
  const addResult = await invModel.addInventoryItem(classification_id,inv_make,inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
  // console.log('addResult', addResult)
  if (addResult){
    let nav = await utilities.getNav()
    req.flash('notice',`The ${inv_color} ${inv_year} ${inv_make} ${inv_model} has been added successfully to inventory system.`)
    res.status(201).render("inventory/managment.ejs", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })
  } else {
    let nav = await utilities.getNav()
    let classDrop = await utilities.buildClassificationDropdown(classification_id)
    req.flash('notice', `The ${inv_color} ${inv_year} ${inv_make} ${inv_model} could not be added due to a database error. Please try again later.`)
    res.status(501).render("inventory/add-inventory.ejs",{
      title:"Add New Inventory",
      nav,
      errors: null,
      classDrop,
      classification_id,
      inv_make,inv_model,
      inv_year, inv_description,
      inv_image, inv_thumbnail,
      inv_price, inv_miles,
      inv_color

    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */

invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id){
    return res.json(invData)
  } else {
    next(new Error("No data found"))
  }
}



/* ***************************
 *  Build Edit Inventory Page
 * ************************** */
invCont.buildEditInv = async function (req, res, next) {
  console.log('in buildEditInv')
  const inventory_id = parseInt(req.params.inventoryId)
  let nav = await utilities.getNav()
  const invItemData = await invModel.getInventoryByInventoryId(inventory_id)
  const invItem = invItemData[0]
  // console.log('invItemData', invItemData)
  let classDrop = await utilities.buildClassificationDropdown(invItem.classification_id)
  const itemName = `${invItem.inv_make} ${invItem.inv_model}`
  res.render("./inventory/edit-inventory.ejs", {
    title: `Edit ${itemName}`,
    nav,
    errors: null,
    classDrop,
    inv_id: invItem.inv_id,
    inv_make: invItem.inv_make,
    inv_model: invItem.inv_model,
    inv_year: invItem.inv_year,
    inv_description: invItem.inv_description,
    inv_image: invItem.inv_image,
    inv_thumbnail: invItem.inv_thumbnail,
    inv_price: invItem.inv_price,
    inv_miles: invItem.inv_miles,
    inv_color: invItem.inv_color,
    classification_id: invItem.classification_id,
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateEditInv = async function(req,res){
  // console.log('in updateEditInv')
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

  // console.log('updateEditInv req.body', req.body)
  const updateResult = await invModel.updateInventoryItem(
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
    
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classDrop = await utilities.buildClassificationDropdown(classification_id)
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory.ejs", {
    title: `Edit ${inv_make} ${inv_model}`,
    nav,
    classDrop: classDrop,
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
 *  Build Delete Confirmation Page
 * ************************** */
invCont.buildDeleteInv = async function (req, res, next) {
  console.log('in buildEditInv')
  const inventory_id = parseInt(req.params.inventoryId)
  let nav = await utilities.getNav()
  const invItemData = await invModel.getInventoryByInventoryId(inventory_id)
  console.log('invItemData', invItemData)
  const invItem = invItemData[0]
  // console.log('invItemData', invItemData)
  let classDrop = await utilities.buildClassificationDropdown(invItem.classification_id)
  res.render("./inventory/delete-confirm.ejs", {
    title:  `Delete ${invItem.inv_make} ${invItem.inv_model}`,
    nav,
    errors: null,
    classDrop,
    inv_id: invItem.inv_id,
    inv_make: invItem.inv_make,
    inv_model: invItem.inv_model,
    inv_year: invItem.inv_year,
    inv_price: invItem.inv_price,
    // classification_id: invItem.classification_id,
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInv = async function(req,res){
  console.log('in deleteInv')
  const {
    inv_id
  } = req.body

  console.log('deleteInv req.body', req.body)
  const invIdInt = parseInt(inv_id)
  const deleteResult = await invModel.deleteInventoryItem(invIdInt)
  if (deleteResult) {
    const deletedItemName = deleteResult.inv_make + " " + deleteResult.inv_model
    req.flash("notice", `The ${deletedItemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the deletion failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

module.exports = invCont
