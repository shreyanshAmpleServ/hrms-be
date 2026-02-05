const { body, query, param, validationResult } = require("express-validator");

const validateTemplate = [
  query("format")
    .optional()
    .isIn(["excel", "csv"])
    .withMessage("Format must be either excel or csv"),

  param("table")
    .notEmpty()
    .withMessage("Table name is required")
    .isAlpha()
    .withMessage("Table name must contain only letters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

const validateImport = [
  param("table")
    .notEmpty()
    .withMessage("Table name is required")
    .isAlpha()
    .withMessage("Table name must contain only letters"),

  body("batchSize")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("Batch size must be between 1 and 1000"),

  body("skipDuplicates")
    .optional()
    .isBoolean()
    .withMessage("Skip duplicates must be a boolean"),

  body("updateExisting")
    .optional()
    .isBoolean()
    .withMessage("Update existing must be a boolean"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

const validateExport = [
  param("table")
    .notEmpty()
    .withMessage("Table name is required")
    .isAlpha()
    .withMessage("Table name must contain only letters"),

  query("search").optional().isString().withMessage("Search must be a string"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage("Limit must be between 1 and 10000"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("sortField")
    .optional()
    .isString()
    .withMessage("Sort field must be a string"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either asc or desc"),

  query("is_active")
    .optional()
    .isBoolean()
    .withMessage("Active status must be a boolean"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = {
  validateTemplate,
  validateImport,
  validateExport,
};
