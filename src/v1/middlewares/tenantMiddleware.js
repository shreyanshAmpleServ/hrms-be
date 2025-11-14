const { getPrismaClient } = require("../../config/db.js");
const logger = require("../../Comman/logger");

const tenantMiddleware = async (req, res, next) => {
  try {
    console.log(" Tenant Middleware Triggered");
    console.log(" Path:", req.path);
    console.log(" URL:", req.url);
    console.log(" Method:", req.method);
    console.log(" Headers:", JSON.stringify(req.headers, null, 2));

    const dbName =
      req.headers["x-tenant-db"] ||
      req.headers["x-database-name"] ||
      req.body?.dbName ||
      req.query?.dbName;

    console.log("Database Name Extracted:", dbName);

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

    console.log("Database name validated");

    try {
      req.prisma = getPrismaClient(dbName);
      req.tenantDb = dbName;
      console.log("Prisma client attached successfully");
      console.log("req.prisma exists:", !!req.prisma);
    } catch (dbError) {
      console.error("Error getting Prisma client:", dbError);
      throw dbError;
    }

    logger.info(
      `Tenant database accessed: ${dbName} | Endpoint: ${req.method} ${req.path}`
    );

    next();
  } catch (error) {
    console.error("Tenant middleware error:", error);
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

module.exports = tenantMiddleware;
