const { getPrismaClient } = require("../config/database");

/**
 * Middleware to attach the correct database client to request
 * Frontend should send database name in headers or body
 */
const tenantMiddleware = (req, res, next) => {
  try {
    // Get database name from request header (preferred) or body
    const dbName =
      req.headers["x-tenant-db"] || req.body.dbName || req.query.dbName;

    if (!dbName) {
      return res.status(400).json({
        success: false,
        message: "Database name (tenant identifier) is required",
      });
    }

    // Validate database name (prevent SQL injection)
    if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
      return res.status(400).json({
        success: false,
        message: "Invalid database name format",
      });
    }

    // Attach Prisma client for this tenant to request object
    req.prisma = getPrismaClient(dbName);
    req.tenantDb = dbName;

    next();
  } catch (error) {
    console.error("Tenant middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to establish database connection",
      error: error.message,
    });
  }
};

module.exports = tenantMiddleware;
