// routes/errorRoute.js
const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorController');

// Define the route that triggers the error
router.get('/generate-error', errorController.triggerError);

module.exports = router;