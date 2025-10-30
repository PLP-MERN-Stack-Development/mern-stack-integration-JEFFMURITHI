// server/validators/categoriesValidator.js
const { body } = require('express-validator');

const createCategory = [
  body('name').isString().trim().notEmpty().withMessage('Category name is required'),
];

module.exports = {
  createCategory,
};
