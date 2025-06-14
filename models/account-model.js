const pool = require('../database')

async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
   try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error){
        return error.message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
    try {
      const sql = "SELECT * FROM account WHERE account_email = $1"
      const result = await pool.query(sql, [account_email])
      // console.log("email results from checkExistingEmail:", result.rows)
      return result.rows
    } catch (error) {
      return error.message
    }
  }


  /* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


  /* *****************************
* Return account data using email address
* ***************************** */
async function getAccountById (account_id) {
// const passwordOption = password ? `account_password,` : ``
  try {
    const result = await pool.query(
      `SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1`,
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


async function updateAccountInfo(account_id, account_firstname, account_lastname, account_email, account_type = 'Client'){
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3, account_type = $4 WHERE account_id = $5 RETURNING account_id, account_firstname, account_lastname, account_email, account_type"
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_type, account_id],true)
    // console.log("updateAccountInfo result:", result)
    return result.rows[0]
  } catch (error){
      return error.message
  }
}

async function updateAccountPassword(account_id, account_password){
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    const result = await pool.query(sql, [account_password,account_id])
    return result.rows[0]
  } catch (error){
    // console.log("updateAccountPassword error:", error)
      return error.message
  }
}

// omits password data
async function getAllAccounts(){
  try {
    const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account"; 
const result = await pool.query(sql)
return result.rows
  } catch (error){
    return error.message
  }
}

async function getAccountTypes(){
  try {
    const sql = "SELECT account_type FROM account "
    const result = await pool.query(sql)
    return result.rows
  }
  catch (error){
    return error.message
  }

}


  

module.exports = {registerAccount,checkExistingEmail, getAccountByEmail, getAccountById, updateAccountInfo, updateAccountPassword, getAllAccounts, getAccountTypes}