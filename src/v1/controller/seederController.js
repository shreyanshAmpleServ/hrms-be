const seederService = require("../services/seederService");
const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

/**
 * Controller to handle Super Admin seeder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const runSeeder = async (req, res) => {
  try {
    // Get database name from query parameter or body
    const dbName = req.query.dbName || req.body.dbName || req.params.dbName;

    if (!dbName) {
      return res.error(
        "Database name is required. Please provide 'dbName' as query parameter.",
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

    // Run seeder - pass existing Prisma client from middleware if available
    const result = await seederService.seedSuperAdmin(
      dbName,
      {
        email,
        password,
        fullName,
      },
      req.prisma // Pass Prisma client from tenantMiddleware if available
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
