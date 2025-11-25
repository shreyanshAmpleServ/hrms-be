// const jwt = require("jsonwebtoken");
// const { withTenantContext } = require("../../utils/prismaProxy");
// const { startScheduler } = require("../services/alertWorkflowService");
// const logger = require("../../Comman/logger");

// let schedulerInitialized = false;

// const authenticateToken = async (req, res, next) => {
//   const token =
//     req.cookies.authToken || req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Access denied. No token provided.",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const tenantDb = decoded.tenantDb;

//     if (!tenantDb) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token. No tenant database found.",
//       });
//     }

//     req.user = decoded;
//     req.tenantDb = tenantDb;

//     console.log(`Auth: User ${decoded.userId} | Tenant: ${tenantDb}`);

//     // Initialize scheduler if needed (outside tenant context to avoid blocking)
//     if (!schedulerInitialized) {
//       try {
//         logger.info(
//           " Starting alert workflow scheduler (first authenticated request)..."
//         );
//         await startScheduler();
//         schedulerInitialized = true;
//         logger.info(" Alert workflow scheduler started successfully");
//       } catch (error) {
//         logger.error(
//           "Failed to start alert workflow scheduler:",
//           error.message
//         );
//       }
//     }

//     // Use withTenantContext to wrap the entire request handling
//     // The context will be maintained for all async operations in the request chain
//     // asyncLocalStorage maintains context across async boundaries automatically
//     // We wrap the entire middleware chain execution to ensure context is maintained
//     return withTenantContext(tenantDb, async () => {
//       // Call next() within the tenant context
//       // The asyncLocalStorage context will be maintained for all subsequent async operations
//       // including route handlers, controllers, services, and models
//       // AsyncLocalStorage automatically propagates context through async/await chains

//       // Handle async route handlers by wrapping next() in a promise
//       return new Promise((resolve, reject) => {
//         try {
//           const result = next();
//           // If next() returns a promise (for async route handlers), await it
//           if (result && typeof result.then === "function") {
//             result.then(resolve).catch(reject);
//           } else {
//             // For sync handlers, resolve immediately
//             resolve(result);
//           }
//         } catch (error) {
//           // If next() throws synchronously, reject the promise
//           reject(error);
//         }
//       });
//     });
//   } catch (error) {
//     return res.status(403).json({
//       success: false,
//       message:
//         error.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
//     });
//   }
// };
// module.exports = { authenticateToken };

const jwt = require("jsonwebtoken");
const { withTenantContext } = require("../../utils/prismaProxy");
const { startScheduler } = require("../services/alertWorkflowService");
const logger = require("../../Comman/logger");

const schedulerInitializedTenants = new Set();

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

    if (!schedulerInitializedTenants.has(tenantDb)) {
      try {
        logger.info(
          " Starting alert workflow scheduler (first authenticated request)..."
        );

        await startScheduler(req);

        schedulerInitializedTenants.add(tenantDb);

        logger.info(" Alert workflow scheduler started successfully");
      } catch (error) {
        logger.error(
          "Failed to start alert workflow scheduler:",
          error.message
        );
        logger.error("Stack:", error.stack);
      }
    }

    return withTenantContext(tenantDb, async () => {
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
    return res.status(403).json({
      success: false,
      message:
        error.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
  }
};

module.exports = { authenticateToken };
