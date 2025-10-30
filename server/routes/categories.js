// server/routes/categories.js
const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const validate = require('../middleware/validate');
const { createCategory } = require('../validators/categoriesValidator');

// GET /api/categories
router.get('/', categoriesController.getCategories);

// POST /api/categories
router.post('/', validate(createCategory), categoriesController.createCategory);

module.exports = router;
