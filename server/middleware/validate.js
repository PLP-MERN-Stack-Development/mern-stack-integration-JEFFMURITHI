// server/middleware/validate.js
const { validationResult } = require('express-validator');

module.exports = (validators) => {
  return async (req, res, next) => {
    // run the validators (they were returned from express-validator)
    for (const validator of validators) {
      await validator.run(req);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  };
};
