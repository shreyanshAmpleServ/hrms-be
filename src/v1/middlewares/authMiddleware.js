const jwt = require("jsonwebtoken");
const { withTenantContext } = require("../../utils/prismaProxy");
const { startScheduler } = require("../services/alertWorkflowService");
const logger = require("../../Comman/logger");

let schedulerInitialized = false;

const authenticateToken = async (req, res, next) => {
  const token =
    req.cookies.authToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tenantDb = decoded.tenantDb;

    if (!tenantDb) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. No tenant database found.",
      });
    }

    req.user = decoded;
    req.tenantDb = tenantDb;

    console.log(`Auth: User ${decoded.userId} | Tenant: ${tenantDb}`);

    // Use withTenantContext to wrap the entire request handling
    // The context will be maintained for all async operations in the request chain
    // asyncLocalStorage maintains context across async boundaries automatically
    return await withTenantContext(tenantDb, async () => {
      if (!schedulerInitialized) {
        try {
          logger.info(
            " Starting alert workflow scheduler (first authenticated request)..."
          );
          await startScheduler();
          schedulerInitialized = true;
          logger.info(" Alert workflow scheduler started successfully");
        } catch (error) {
          logger.error(
            "Failed to start alert workflow scheduler:",
            error.message
          );
        }
      }
      // Call next() within the tenant context
      // The asyncLocalStorage context will be maintained for all subsequent operations
      // Express middleware next() can return a promise for async handlers
      try {
        const result = next();
        // If next() returns a promise (which it does for async handlers), await it
        if (result && typeof result.then === "function") {
          await result;
        }
      } catch (error) {
        throw error;
      }
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message:
        error.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
  }
};
module.exports = { authenticateToken };
