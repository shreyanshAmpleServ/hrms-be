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

    return withTenantContext(tenantDb, async () => {
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
      try {
        const result = next();
        if (result && typeof result.then === "function") {
          return await result;
        }
        return result;
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
