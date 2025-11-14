const seederService = require("../services/seederService");
const CustomError = require("../../utils/CustomError");

/**
 * Controller to handle Super Admin seeder
 * Supports both:
 * 1. Using x-tenant-db header (via tenantMiddleware) - uses req.prisma
 * 2. Explicit dbName parameter - creates new connection
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const runSeeder = async (req, res) => {
  try {
    // Get database name from query parameter, body, or tenantMiddleware
    const dbName =
      req.query.dbName || req.body.dbName || req.params.dbName || req.tenantDb; // From tenantMiddleware

    if (!dbName) {
      return res.error(
        "Database name is required. Please provide 'x-tenant-db' header or 'dbName' as query/body parameter.",
        400
      );
    }

    // Validate database name format
    if (!/^[a-zA-Z0-9_-]+$/.test(dbName)) {
      return res.error(
        "Invalid database name format. Only alphanumeric characters, underscores, and hyphens are allowed.",
        400
      );
    }

    // Get optional user details from query or body
    const email = req.query.email || req.body.email || "admin@hrms.com";
    const password = req.query.password || req.body.password || "admin@123";
    const fullName = req.query.fullName || req.body.fullName || "Super Admin";

    // If req.prisma exists (from tenantMiddleware), use it; otherwise create new connection
    const prisma = req.prisma || null;

    // Run seeder
    const result = await seederService.seedSuperAdmin(
      dbName,
      {
        email,
        password,
        fullName,
      },
      prisma
    );

    return res.success(result.data, result.message, 201);
  } catch (error) {
    console.error("Seeder error:", error);
    return res.error(
      error.message || "Failed to run seeder",
      error.status || 500
    );
  }
};

module.exports = {
  runSeeder,
};
