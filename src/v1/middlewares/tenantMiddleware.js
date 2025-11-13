const { getPrismaClient } = require("../../config/db.js");

const tenantMiddleware = (req, res, next) => {
  try {
    const dbName =
      req.headers["x-tenant-db"] || req.body.dbName || req.query.dbName;

    if (!dbName) {
      return res.status(400).json({
        success: false,
        message: "Database name  is required",
      });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
      return res.status(400).json({
        success: false,
        message: "Invalid database name format",
      });
    }

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
