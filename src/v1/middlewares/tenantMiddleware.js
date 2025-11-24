const { getPrismaClient } = require("../../config/db.js");
const {
  withTenantContext,
  extractTenantDbFromRequest,
} = require("../../utils/prismaProxy");
const logger = require("../../Comman/logger");

const tenantMiddleware = async (req, res, next) => {
  try {
    const dbName =
      req.headers["x-tenant-db"] ||
      req.headers["x-database-name"] ||
      req.body?.dbName ||
      req.query?.dbName;

    if (!dbName) {
      logger.warn("Missing tenant database identifier in request");
      return res.status(400).json({
        success: false,
        message:
          "Database name (tenant identifier) is required. Please provide 'x-tenant-db' header or 'dbName' parameter.",
      });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(dbName)) {
      logger.warn(`Invalid database name format attempted: ${dbName}`);
      return res.status(400).json({
        success: false,
        message:
          "Invalid database name format. Only alphanumeric characters, underscores, and hyphens are allowed.",
      });
    }

    req.prisma = getPrismaClient(dbName);
    req.tenantDb = dbName;

    logger.info(
      `Tenant database accessed: ${dbName} | Endpoint: ${req.method} ${req.path}`
    );

    return withTenantContext(dbName, async () => {
      return new Promise((resolve, reject) => {
        try {
          const result = next();
          if (result && typeof result.then === "function") {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    logger.error("Tenant middleware error:", {
      error: error.message,
      stack: error.stack,
      path: req.path,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to establish database connection",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

const optionalTenantMiddleware = async (req, res, next) => {
  try {
    const { asyncLocalStorage } = require("../../utils/prismaProxy");
    const existingStore = asyncLocalStorage.getStore();

    if (existingStore && existingStore.tenantDb) {
      req.tenantDb = existingStore.tenantDb;
      req.prisma = getPrismaClient(existingStore.tenantDb);
      return next();
    }

    const dbName = extractTenantDbFromRequest(req);

    if (dbName && /^[a-zA-Z0-9_-]+$/.test(dbName)) {
      req.prisma = getPrismaClient(dbName);
      req.tenantDb = dbName;

      return withTenantContext(dbName, async () => {
        return new Promise((resolve, reject) => {
          try {
            const result = next();
            if (result && typeof result.then === "function") {
              result.then(resolve).catch(reject);
            } else {
              resolve(result);
            }
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    next();
  } catch (error) {
    logger.error("Optional tenant middleware error:", {
      error: error.message,
      stack: error.stack,
      path: req.path,
    });
    next(error);
  }
};

module.exports = tenantMiddleware;
module.exports.optionalTenantMiddleware = optionalTenantMiddleware;
