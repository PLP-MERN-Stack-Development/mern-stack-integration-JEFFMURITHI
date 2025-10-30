// server/validators/postsValidator.js
const { body, param, query } = require('express-validator');

const createOrUpdatePost = [
  body('title').isString().trim().notEmpty().withMessage('Title is required'),
  body('content').isString().trim().notEmpty().withMessage('Content is required'),
  body('category').optional().isMongoId().withMessage('category must be a valid id'),
  body('featuredImage').optional().isString().withMessage('featuredImage should be a string (URL/path)'),
];

const getPostsQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1 }).toInt(),
  query('q').optional().isString(),
  query('category').optional().isMongoId(),
];

const idParam = [
  param('id').isMongoId().withMessage('Invalid post id'),
];

module.exports = {
  createOrUpdatePost,
  getPostsQuery,
  idParam,
};
