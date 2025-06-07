require("dotenv").config();
const { Pool } = require("pg")
// console.log("NODE_ENV:", process.env.NODE_ENV);
// console.log("DATABASE_URL:", process.env.DATABASE_URL);

function toggleQueryConsole( message, object, report=false) {
  if (report) {
    console.log(message, {object} )
  }


}
/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */
let pool
if (process.env.NODE_ENV == "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    idleTimeoutMillis: 30000, 
    connectionTimeoutMillis: 5000,
    max: 10, 
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Added for troubleshooting queries
// during development
module.exports = {
  async query(text, params, report=false) {
    try {
      const res = await pool.query(text, params)
      toggleQueryConsole("executed query", { text, params },report)
      // console.log("executed query", { text })

      return res
    } catch (error) {
      toggleQueryConsole(
        "error in query",
        { text, params, error: error.message },report
      )
      // console.error("error in query", { text })
      throw error
    }
  },
}
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  module.exports = pool
}