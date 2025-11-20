const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { asyncLocalStorage } = require("../../utils/prismaProxy");

/**
 * Ensures a directory exists, creating it recursively if it doesn't.
 * @param {string} dir - The directory path to ensure exists
 */
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Multer disk storage configuration for file uploads.
 * Determines upload destination and filename dynamically.
 */
const storage = multer.diskStorage({
  /**
   * Determines the destination folder for uploaded files based on entityType.
   * @param {Object} req - Express request object
   * @param {Object} file - Multer file object
   * @param {Function} cb - Callback function
   */
  destination: (req, file, cb) => {
    const entityType = req.body.entityType || "general";
    const uploadDir = `uploads/${entityType}`;
    ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  /**
   * Generates a unique filename for uploaded files.
   * Format: <timestamp>-<fieldname>.<extension>
   * @param {Object} req - Express request object
   * @param {Object} file - Multer file object
   * @param {Function} cb - Callback function
   */
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.fieldname}${extension}`);
  },
});

/**
 * Multer upload configuration using memory storage.
 * Accepts all file types (no fileFilter).
 * File size limit: 5MB
 */
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 5 },
});

/**
 * Wraps multer middleware to preserve AsyncLocalStorage tenant context.
 * This ensures the tenant database context is maintained through file upload processing.
 * @param {Function} middleware - The multer middleware function to wrap
 * @returns {Function} Wrapped middleware that preserves async context
 */
const preserveContext = (middleware) => {
  return (req, res, next) => {
    const store = asyncLocalStorage.getStore();
    if (!store || !store.tenantDb) {
      return middleware(req, res, next);
    }

    const tenantDb = store.tenantDb;
    req.tenantDb = tenantDb;

    /**
     * Wrapped next() function that maintains tenant context.
     * Critical: when multer calls next(), it must be within the context.
     * @param {...any} args - Arguments to pass to next()
     * @returns {any} Result from next() call
     */
    const wrappedNext = (...args) => {
      return asyncLocalStorage.run(store, () => {
        const result = next(...args);
        if (result && typeof result.then === "function") {
          return result.catch((error) => {
            return asyncLocalStorage.run(store, () => {
              throw error;
            });
          });
        }
        return result;
      });
    };

    try {
      return asyncLocalStorage.run(store, () => {
        const result = middleware(req, res, wrappedNext);
        if (result && typeof result.then === "function") {
          return result.catch((error) => {
            return asyncLocalStorage.run(store, () => {
              throw error;
            });
          });
        }
        return result;
      });
    } catch (error) {
      return asyncLocalStorage.run(store, () => {
        throw error;
      });
    }
  };
};

/**
 * Upload middleware with context preservation.
 * All methods are wrapped to maintain AsyncLocalStorage tenant context.
 */
const upload = {
  /**
   * Upload a single file.
   * @param {string} fieldName - The field name for the file
   * @returns {Function} Middleware function
   */
  single: (fieldName) => preserveContext(multerUpload.single(fieldName)),
  /**
   * Upload multiple files as an array.
   * @param {string} fieldName - The field name for the files
   * @param {number} maxCount - Maximum number of files
   * @returns {Function} Middleware function
   */
  array: (fieldName, maxCount) =>
    preserveContext(multerUpload.array(fieldName, maxCount)),
  /**
   * Upload multiple files with different field names.
   * @param {Array} fields - Array of field configurations
   * @returns {Function} Middleware function
   */
  fields: (fields) => preserveContext(multerUpload.fields(fields)),
  /**
   * Accept only text fields, no files.
   * @returns {Function} Middleware function
   */
  none: () => preserveContext(multerUpload.none()),
  /**
   * Accept any files regardless of field name.
   * @returns {Function} Middleware function
   */
  any: () => preserveContext(multerUpload.any()),
};

module.exports = upload;
