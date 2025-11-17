const { getPrismaClient, setPrisma } = require("../../config/prismaContext.js");
const logger = require("../../Comman/logger");

/**
 * Dynamic Tenant Database Middleware
 *
 * Extracts database name from request headers and sets up Prisma client:
 * - x-tenant-db (required): Database name
 *
 * The Prisma client is stored in async context and can be accessed
 * globally using getPrisma() from prismaContext.js
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    // Extract database name from headers
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
          "Database name (tenant identifier) is required. Please provide 'x-tenant-db' header.",
      });
    }

    // Validate database name format
    if (!/^[a-zA-Z0-9_-]+$/.test(dbName)) {
      logger.warn(`Invalid database name format attempted: ${dbName}`);
      return res.status(400).json({
        success: false,
        message:
          "Invalid database name format. Only alphanumeric characters, underscores, and hyphens are allowed.",
      });
    }

    try {
      // Get or create Prisma client for this database
      const prisma = getPrismaClient(dbName);

      // Set it in async context for global access
      setPrisma(prisma);

      // Also attach to request for backward compatibility
      req.prisma = prisma;
      req.tenantDb = dbName;

      logger.info(
        `Tenant database accessed: ${dbName} | Endpoint: ${req.method} ${req.path}`
      );
    } catch (dbError) {
      console.error("Error getting Prisma client:", dbError);
      logger.error("Database connection error:", {
        error: dbError.message,
        dbName: dbName,
        path: req.path,
      });
      throw dbError;
    }

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
