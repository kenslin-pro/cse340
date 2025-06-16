const pool = require("../database/")

const getReviewsByAccountId = async (account_id) => {
  try {
    const data = await pool.query(
      `SELECT r.*, a.account_firstname, a.account_lastname
       FROM public.reviews r JOIN public.account a 
       ON r.account_id = a.account_id
       WHERE r.account_id = $1
       ORDER BY r.review_date DESC`, [account_id])
    return data.rows
  } catch (error) {
    error.message
  }
}

const getReviewsByReviewId = async (review_id) => {
  try {
    const data = await pool.query("SELECT * FROM public.reviews WHERE review_id = $1", [review_id])
    console.log(data.rows[0])
    return data.rows[0]
  } catch (error) {
    error.message
  }
}

const getReviewsByInvId = async (inv_id) => {
  try {
    const data = await pool.query(
      `SELECT r.*, a.account_firstname, a.account_lastname
       FROM public.reviews r JOIN public.account a 
       ON r.account_id = a.account_id
       WHERE r.inv_id = $1
       ORDER BY r.review_date DESC`, [inv_id])
    return data.rows
  } catch (error) {
    error.message
  }
}

const addNewReview = async (review_text, inv_id, account_id) => {
  try {
    const data = await pool.query("INSERT INTO reviews (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *", [review_text, inv_id, account_id])
    return data.rows[0]
  } catch (error) {
    return error.message
  }
}

const updateReview = async (review_text, review_id) => {
  try {
    const data = await pool.query("UPDATE public.reviews SET review_text = $1 WHERE review_id = $2 RETURNING *", [review_text, review_id])
    return data.rows[0]
  } catch (error) {
    return error.message
  }
}

const deleteReview = async (review_id) => {
  try {
    const data = await pool.query('DELETE FROM reviews WHERE review_id = $1', [review_id])
    return data
  } catch (error) {
    error.message
  }
}

module.exports = { getReviewsByAccountId, getReviewsByReviewId, getReviewsByInvId, addNewReview, updateReview, deleteReview }