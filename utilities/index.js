const invModel = require("../models/inventory-model");
const Utilities = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Utilities.getNav = async function (req, res, next) {
  try {
    const data = await invModel.getClassifications();

    if (!data || !data.rows) {
      console.error("Error: No se encontraron clasificaciones.");
      return "<ul><li><a href='/' title='Home page'>Home</a></li></ul>";
    }

    let list = `<ul>
                  <li><a href="/" title="Home page">Home</a></li>`;
    data.rows.forEach((row) => {
      list += `<li>
                  <a href="/inv/type/${row.classification_id}" 
                     title="See our inventory of ${row.classification_name} vehicles">
                     ${row.classification_name}
                  </a>
               </li>`;
    });
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("Error al construir la navegación:", error);
    return "<ul><li><a href='/' title='Home page'>Home</a></li></ul>";
  }
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Utilities.buildClassificationGrid = async function (data) {
  let grid = ""; // Inicializa grid

  if (data && data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += `<li>
                <a href="../../inv/detail/${vehicle.inv_id}" 
                   title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                   <img src="${vehicle.inv_thumbnail}" 
                        alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
                </a>
                <div class="namePrice">
                  <hr />
                  <h2>
                    <a href="../../inv/detail/${vehicle.inv_id}" 
                       title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                       ${vehicle.inv_make} ${vehicle.inv_model}
                    </a>
                  </h2>
                  <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
                </div>
               </li>`;
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }

  return grid;
};

/* ****************************************
 * Middleware For Handling Errors
 * **************************************** */
Utilities.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ***************************
 * Format Item Details for the View
 * ************************** */
Utilities.formatItemDetails = function (item) {
  // Format price and mileage with commas
  const formattedPrice = Number(item.inv_price).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const formattedMileage = Number(item.inv_miles).toLocaleString();

  // Create the HTML structure for the item details
  const itemHTML = `
  <div class="item-details">
    <img src="${item.inv_image}" alt="${item.inv_make} ${item.inv_model}" class="full-image" />
    <div class="item-content">
      <h2>${item.inv_make} ${item.inv_model}</h2>
      <p><strong>Make and Model:</strong> ${item.inv_make} ${item.inv_model}</p>
      <p><strong>Year:</strong> ${item.inv_year}</p>
      <p><strong>Price:</strong> ${formattedPrice}</p>
      <p><strong>Mileage:</strong> ${formattedMileage}</p>
      <p><strong>Description:</strong> ${item.inv_description}</p>
    </div>
  </div>
`;

  return itemHTML;
};

module.exports = Utilities;