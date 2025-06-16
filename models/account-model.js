const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account 
      (account_firstname, account_lastname, account_email, account_password, account_type) 
      VALUES ($1, $2, $3, $4, 'Client') RETURNING *`
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    console.log("Error in getAccountByEmail", error)
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using ID
* ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    console.log("Error in getAccountById", error)
    return new Error("No matching account found")
  }
}

/* *****************************
* Update account info
* ***************************** */
const updateAccount = async (account_id, account_firstname, account_lastname, account_email) => {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4"
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return result.rows
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Update account password
* ***************************** */
const passwordUpdate = async (account_id, account_password) => {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2"
    const result = await pool.query(sql, [account_password, account_id])
    return result.rows
  } catch (error) {
    return error.message
  }
}

/* ******************************
 *  Get reviews by account_id
 * ****************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `
      SELECT r.review_id, r.review_date, r.review_text, i.inv_make, i.inv_model
      FROM review AS r
      JOIN inventory AS i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC
    `
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("Error retrieving reviews:", error)
    return []
  }
}

/* *****************************
* Export all functions
* ***************************** */
module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  passwordUpdate,
  getReviewsByAccountId
}
